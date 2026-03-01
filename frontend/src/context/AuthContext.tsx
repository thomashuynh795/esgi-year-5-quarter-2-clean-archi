import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { AuthUser, UserRole } from "../domain/models";
import { AuthService, decodeJwt } from "../services/authService";

interface AuthContextValue {
  user: AuthUser | null;
  isBootstrapping: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? (JSON.parse(storedUser) as AuthUser) : null;
  });
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true;
    const token = localStorage.getItem("token");

    async function bootstrap() {
      if (!token) {
        if (mounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      const decoded = decodeJwt(token);
      if (!decoded?.sub) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (mounted) {
          setUser(null);
          setIsBootstrapping(false);
        }
        return;
      }

      try {
        const currentUser = await AuthService.getCurrentUser(decoded.sub);
        localStorage.setItem("user", JSON.stringify(currentUser));
        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setUser(null);
      setIsBootstrapping(false);
    };

    window.addEventListener("auth-unauthorized", handleUnauthorized);
    return () => window.removeEventListener("auth-unauthorized", handleUnauthorized);
  }, []);

  async function login(email: string, password: string): Promise<AuthUser> {
    const token = await AuthService.login(email, password);
    localStorage.setItem("token", token);

    const decoded = decodeJwt(token);
    if (!decoded?.sub) {
      localStorage.removeItem("token");
      throw new Error("Token invalide recu a la connexion.");
    }

    const currentUser = await AuthService.getCurrentUser(decoded.sub);
    setUser(currentUser);
    localStorage.setItem("user", JSON.stringify(currentUser));
    return currentUser;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  function hasRole(...roles: UserRole[]) {
    return roles.some((role) => user?.roles.includes(role));
  }

  return (
    <AuthContext.Provider value={{ user, isBootstrapping, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

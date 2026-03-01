import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Parking from "./pages/Parking";
import MyReservations from "./pages/MyReservations";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import type { UserRole } from "./domain/models";

function getDefaultPath(roles: UserRole[]) {
  if (roles.includes("SECRETARY")) {
    return "/admin";
  }
  if (roles.includes("MANAGER")) {
    return "/dashboard";
  }
  return "/parking";
}

function RouteGuard({
  children,
  roles,
}: {
  children: ReactElement;
  roles?: UserRole[];
}) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-3xl border border-stone-200 bg-white px-8 py-6 text-sm text-stone-600 shadow-sm">
          Chargement de votre espace...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.some((role) => user.roles.includes(role))) {
    return <Navigate to={getDefaultPath(user.roles)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }: { children: ReactElement }) {
  const { user, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-3xl border border-stone-200 bg-white px-8 py-6 text-sm text-stone-600 shadow-sm">
          Chargement...
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={getDefaultPath(user.roles)} replace />;
  }

  return children;
}

function AppLayout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/parking"
          element={
            <RouteGuard roles={["EMPLOYEE", "MANAGER", "SECRETARY"]}>
              <Parking />
            </RouteGuard>
          }
        />
        <Route
          path="/my-reservations"
          element={
            <RouteGuard roles={["EMPLOYEE", "MANAGER", "SECRETARY"]}>
              <MyReservations />
            </RouteGuard>
          }
        />
        <Route
          path="/admin"
          element={
            <RouteGuard roles={["SECRETARY"]}>
              <AdminDashboard />
            </RouteGuard>
          }
        />
        <Route
          path="/dashboard"
          element={
            <RouteGuard roles={["MANAGER"]}>
              <Dashboard />
            </RouteGuard>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-stone-100 text-stone-900">
          <AppLayout />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

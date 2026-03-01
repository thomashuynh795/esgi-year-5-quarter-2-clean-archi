import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout, hasRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) {
    return null;
  }

  const links = [
    { to: "/parking", label: "Parking", visible: true },
    { to: "/my-reservations", label: "Mes reservations", visible: true },
    { to: "/admin", label: "Admin", visible: hasRole("SECRETARY") },
    { to: "/dashboard", label: "Dashboard", visible: hasRole("MANAGER") },
  ].filter((link) => link.visible);

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => navigate(hasRole("SECRETARY") ? "/admin" : hasRole("MANAGER") ? "/dashboard" : "/parking")}
            className="font-serif text-2xl font-semibold tracking-tight text-stone-900"
          >
            ParkOps
          </button>
          <nav className="flex flex-wrap gap-2">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white"
                      : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-2xl bg-stone-100 px-4 py-2 text-sm text-stone-700">
            <div className="font-medium text-stone-900">{user.email}</div>
            <div>{user.roles.join(" / ")}</div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Deconnexion
          </button>
        </div>
      </div>
    </header>
  );
}

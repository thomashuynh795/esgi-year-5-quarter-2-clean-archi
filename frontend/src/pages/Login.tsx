import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../services/api";

function getHomePath(roles: string[]) {
  if (roles.includes("SECRETARY")) {
    return "/admin";
  }
  if (roles.includes("MANAGER")) {
    return "/dashboard";
  }
  return "/parking";
}

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const user = await login(email, password);
      navigate(getHomePath(user.roles), { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof ApiError ? error.message : "Connexion impossible.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="hidden bg-stone-900 px-10 py-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.35em] text-emerald-200">Parking Reservation System</div>
          <h1 className="mt-6 max-w-xl font-serif text-5xl font-semibold leading-tight">
            Une interface claire pour reserver, administrer et piloter le parking.
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-stone-300">
            Utilisateurs cibles: employes, secretariat, managers. Authentification, roles, garde de routes
            et UX simplifiee.
          </p>
        </div>

        <div className="grid max-w-xl gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Employee</div>
            <div className="mt-2 text-sm text-stone-300">Reservation, annulation, check-in.</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Secretary</div>
            <div className="mt-2 text-sm text-stone-300">Admin, editions, gestion utilisateurs.</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold">Manager</div>
            <div className="mt-2 text-sm text-stone-300">Reservation longue duree et dashboard.</div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-stone-100 px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-stone-200 bg-white p-8 shadow-xl">
          <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Connexion</div>
          <h2 className="mt-3 font-serif text-4xl font-semibold text-stone-900">Bienvenue</h2>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Connectez-vous pour acceder au parking, a vos reservations ou au dashboard.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
                placeholder="john@employee.com"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-stone-700">Mot de passe</span>
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </label>

            {errorMessage && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="mt-8 rounded-3xl bg-stone-50 p-4 text-sm text-stone-600">
            <div className="font-semibold text-stone-800">Comptes de demo</div>
            <div className="mt-2">`john@employee.com`</div>
            <div>`jane@manager.com`</div>
            <div>`admin@secretary.com`</div>
            <div className="mt-2">Mot de passe: `password123`</div>
          </div>
        </div>
      </section>
    </div>
  );
}

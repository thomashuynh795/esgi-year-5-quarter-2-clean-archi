import { useEffect, useState } from "react";
import { buildMockStats } from "../domain/mock";
import type { DashboardStatistics } from "../domain/models";
import { formatDateInput } from "../domain/parkingRules";
import { AdminService } from "../services/AdminService";
import { ApiError } from "../services/api";

const managerWidgets = [
  {
    title: "Usage moyen",
    value: "Placeholder",
    description: "Widget reserve pour l'usage moyen hebdomadaire par employe.",
  },
  {
    title: "Usage chargeurs",
    value: "Placeholder",
    description: "Widget reserve a la proportion reelle d'utilisation des bornes.",
  },
];

export default function Dashboard() {
  const [date, setDate] = useState(formatDateInput(new Date()));
  const [stats, setStats] = useState<DashboardStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setErrorMessage(null);
      try {
        const result = await AdminService.getStatistics(date);
        setStats(result);
      } catch (error) {
        setStats(buildMockStats(date));
        setErrorMessage(
          error instanceof ApiError
            ? `${error.message} Affichage des widgets de secours.`
            : "Dashboard indisponible, affichage de secours actif.",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadDashboard();
  }, [date]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <section className="rounded-[2rem] bg-emerald-700 px-6 py-8 text-white shadow-lg">
        <div className="text-sm uppercase tracking-[0.35em] text-emerald-100">Manager dashboard</div>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Suivi d'occupation et pilotage</h1>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-emerald-50">
          Route manager dediee. Les KPI existants sont branches, et les widgets manquants sont prepares
          pour les prochains endpoints.
        </p>
      </section>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <label className="space-y-2">
          <span className="text-sm font-medium text-stone-700">Date observee</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="w-full max-w-xs rounded-2xl border border-stone-200 px-4 py-3"
          />
        </label>
      </section>

      {loading ? (
        <div className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm">
          Chargement des metriques...
        </div>
      ) : (
        <>
          <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-500">Taux d'occupation</div>
              <div className="mt-3 text-4xl font-semibold text-stone-900">{stats?.fillingRate}</div>
              <div className="mt-2 text-sm text-stone-600">{stats?.totalReservations} reservations sur {stats?.totalSpots} places</div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-500">No-show</div>
              <div className="mt-3 text-4xl font-semibold text-stone-900">{stats?.noShowRate}</div>
              <div className="mt-2 text-sm text-stone-600">{stats?.totalCheckIns} check-ins comptabilises</div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-500">Places a chargeur</div>
              <div className="mt-3 text-4xl font-semibold text-stone-900">{stats?.electricSpots}</div>
              <div className="mt-2 text-sm text-stone-600">{stats?.electricRate} du parc total</div>
            </article>

            <article className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
              <div className="text-sm uppercase tracking-[0.25em] text-stone-500">Date mesuree</div>
              <div className="mt-3 text-2xl font-semibold text-stone-900">{stats?.date ?? date}</div>
              <div className="mt-2 text-sm text-stone-600">Snapshot journalier</div>
            </article>
          </section>

          <section className="mt-8 grid gap-4 lg:grid-cols-2">
            {managerWidgets.map((widget) => (
              <article key={widget.title} className="rounded-[2rem] border border-dashed border-stone-300 bg-stone-50 p-6">
                <div className="text-sm uppercase tracking-[0.25em] text-stone-500">{widget.title}</div>
                <div className="mt-3 text-3xl font-semibold text-stone-800">{widget.value}</div>
                <p className="mt-3 text-sm leading-6 text-stone-600">{widget.description}</p>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}

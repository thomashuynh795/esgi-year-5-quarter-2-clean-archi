import { useEffect, useState } from "react";
import { buildMockReservationHistory, buildMockReservations } from "../domain/mock";
import type { ReservationHistoryEntry, ReservationViewModel } from "../domain/models";
import { formatDateInput } from "../domain/parkingRules";
import { ParkingService } from "../services/ParkingService";
import { ApiError } from "../services/api";

function statusClasses(status: string) {
  if (status === "CHECKED_IN") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "CANCELLED") {
    return "bg-stone-200 text-stone-700";
  }
  return "bg-sky-100 text-sky-800";
}

export default function MyReservations() {
  const today = formatDateInput(new Date());
  const [reservations, setReservations] = useState<ReservationViewModel[]>([]);
  const [history, setHistory] = useState<ReservationHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [checkInSpotId, setCheckInSpotId] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setErrorMessage(null);

    const start = today;
    const end = formatDateInput(new Date(Date.now() + 1000 * 60 * 60 * 24 * 14));

    try {
      const [reservationResults, historyResults] = await Promise.all([
        ParkingService.getMyReservations().catch(() => buildMockReservations()),
        ParkingService.getReservationHistory({ start, end }).catch(() =>
          buildMockReservationHistory(start, end),
        ),
      ]);

      setReservations(reservationResults);
      setHistory(historyResults);
    } catch (error) {
      setReservations(buildMockReservations());
      setHistory(buildMockReservationHistory(start, end));
      setErrorMessage(
        error instanceof ApiError
          ? `${error.message} L'historique affiche des donnees mockees.`
          : "Impossible de charger vos reservations.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  async function handleCancel(reservationId: string) {
    try {
      setBusyId(reservationId);
      await ParkingService.cancelReservation(reservationId);
      setFeedback("Reservation annulee.");
      await loadData();
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Annulation impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCheckIn(reservationId: string) {
    try {
      setBusyId(reservationId);
      await ParkingService.checkIn(reservationId);
      setFeedback("Check-in enregistre.");
      await loadData();
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Check-in impossible.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleQrCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setBusyId("qr");
      await ParkingService.checkInByQr(checkInSpotId.trim().toUpperCase());
      setFeedback("Check-in QR simule avec succes.");
      setCheckInSpotId("");
      await loadData();
    } catch (error) {
      setFeedback(error instanceof ApiError ? error.message : "Check-in QR impossible.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Mes reservations</div>
          <h1 className="mt-3 font-serif text-4xl font-semibold text-stone-900">
            Suivi, annulation et check-in.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">
            Le check-in est obligatoire a l'arrivee. Les reservations AM non checkees avant 11:00
            redeviennent disponibles.
          </p>
        </div>

        <form
          onSubmit={handleQrCheckIn}
          className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm"
        >
          <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Check-in QR</div>
          <h2 className="mt-3 text-xl font-semibold text-stone-900">Simuler le scan d'une place</h2>
          <p className="mt-2 text-sm text-stone-600">
            L'endpoint QR n'est pas encore finalise cote produit. L'action UI est prete.
          </p>
          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium text-stone-700">Identifiant de place</span>
            <input
              value={checkInSpotId}
              onChange={(event) => setCheckInSpotId(event.target.value)}
              placeholder="Ex: A01"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3"
            />
          </label>
          <button
            type="submit"
            disabled={busyId === "qr" || !checkInSpotId.trim()}
            className="mt-4 rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-300"
          >
            {busyId === "qr" ? "Verification..." : "Lancer le check-in"}
          </button>
        </form>
      </section>

      {(feedback || errorMessage) && (
        <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
          {feedback || errorMessage}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-stone-900">Reservations a venir</h2>
            <p className="text-sm text-stone-600">Vous pouvez annuler vos reservations ou faire le check-in.</p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-stone-500">Chargement...</div>
        ) : reservations.length === 0 ? (
          <div className="rounded-3xl bg-stone-50 p-8 text-center text-stone-600">
            Aucune reservation a afficher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-stone-200 text-stone-500">
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Slot</th>
                  <th className="pb-3">Place</th>
                  <th className="pb-3">Etat</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {reservations.map((reservation) => (
                  <tr key={reservation.id}>
                    <td className="py-4 text-stone-800">{reservation.date}</td>
                    <td className="py-4 text-stone-600">{reservation.slot}</td>
                    <td className="py-4 font-semibold text-stone-900">{reservation.spotLabel}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(reservation.status)}`}>
                        {reservation.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          disabled={!reservation.canCheckIn || busyId === reservation.id}
                          onClick={() => void handleCheckIn(reservation.id)}
                          className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-200"
                        >
                          Check-in
                        </button>
                        <button
                          type="button"
                          disabled={!reservation.canCancel || busyId === reservation.id}
                          onClick={() => void handleCancel(reservation.id)}
                          className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-300"
                        >
                          Annuler
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <div className="text-sm uppercase tracking-[0.35em] text-stone-500">Historique</div>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900">Occupation du parking</h2>
          <p className="mt-2 text-sm text-stone-600">
            Structure UI prete pour l'historique complet des reservations.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {history.slice(0, 8).map((entry) => (
            <article key={`${entry.date}-${entry.slot}`} className="rounded-3xl border border-stone-200 bg-stone-50 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-stone-500">{entry.slot}</div>
              <div className="mt-2 text-lg font-semibold text-stone-900">{entry.date}</div>
              <div className="mt-3 text-sm text-stone-600">{entry.usedSpotIds.length} places utilisees</div>
              <div className="text-sm text-stone-600">{entry.freeSpotIds.length} places libres</div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

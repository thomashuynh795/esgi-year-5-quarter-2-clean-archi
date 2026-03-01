import { useEffect, useMemo, useState } from "react";
import type { ParkingSpot, ReservationDraft, UserRole, VehicleType } from "../domain/models";
import { validateReservationDraft } from "../domain/parkingRules";
import { ParkingService } from "../services/ParkingService";
import { ApiError } from "../services/api";

interface CreateReservationModalProps {
  isOpen: boolean;
  spot: ParkingSpot | null;
  roles: UserRole[];
  initialDraft: ReservationDraft;
  onClose: () => void;
  onSuccess: () => Promise<void> | void;
}

export default function CreateReservationModal({
  isOpen,
  spot,
  roles,
  initialDraft,
  onClose,
  onSuccess,
}: CreateReservationModalProps) {
  const [draft, setDraft] = useState<ReservationDraft>(initialDraft);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDraft({ ...initialDraft, spotId: spot?.id ?? initialDraft.spotId });
      setErrorMessage(null);
    }
  }, [initialDraft, isOpen, spot]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const validation = useMemo(() => {
    if (!spot) {
      return {
        isValid: false,
        errors: ["Aucune place selectionnee."],
        requestedDays: 0,
      };
    }

    return validateReservationDraft({
      draft,
      roles,
      spot,
      today: initialDraft.startDate,
    });
  }, [draft, initialDraft.startDate, roles, spot]);

  if (!isOpen || !spot) {
    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validation.isValid) {
      setErrorMessage(validation.errors[0]);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      const spotId = draft.spotId || spot?.id;
      if (!spotId) {
        setErrorMessage("Aucune place selectionnee.");
        return;
      }
      await ParkingService.createReservation({
        spotId,
        startDate: draft.startDate,
        endDate: draft.endDate,
        slot: draft.slot,
        needsCharge: draft.needsCharge,
      });
      await onSuccess();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof ApiError ? error.message : "La reservation n'a pas pu etre creee.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function updateVehicleType(vehicleType: VehicleType) {
    setDraft((current) => ({
      ...current,
      vehicleType,
      needsCharge: vehicleType === "THERMAL" ? false : current.needsCharge,
    }));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-6">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-stone-500">Nouvelle reservation</div>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-stone-900">{spot.id}</h2>
            <p className="mt-2 text-sm text-stone-600">
              Rangee {spot.row} · {spot.hasCharger ? "place electrique / hybride" : "place standard"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
          >
            Fermer
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Place</span>
              <input
                value={spot.id}
                readOnly
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-700"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Slot</span>
              <select
                value={draft.slot}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, slot: event.target.value as "AM" | "PM" }))
                }
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900"
              >
                <option value="AM">AM · Matin</option>
                <option value="PM">PM · Apres-midi</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Date de debut</span>
              <input
                type="date"
                min={initialDraft.startDate}
                value={draft.startDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startDate: event.target.value,
                    endDate: event.target.value > current.endDate ? event.target.value : current.endDate,
                  }))
                }
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Date de fin</span>
              <input
                type="date"
                min={draft.startDate}
                value={draft.endDate}
                onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Type de vehicule</span>
              <select
                value={draft.vehicleType}
                onChange={(event) => updateVehicleType(event.target.value as VehicleType)}
                className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-900"
              >
                <option value="THERMAL">Thermique</option>
                <option value="HYBRID">Hybride</option>
                <option value="ELECTRIC">Electrique</option>
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <input
                type="checkbox"
                checked={draft.needsCharge}
                disabled={draft.vehicleType === "THERMAL"}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, needsCharge: event.target.checked }))
                }
                className="h-4 w-4 rounded border-stone-300"
              />
              <span>
                <span className="block text-sm font-medium text-stone-800">Besoin de charge</span>
                <span className="block text-xs text-stone-600">
                  Disponible uniquement en rangee A ou F
                </span>
              </span>
            </label>
          </div>

          <div className="rounded-3xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700">
            <div className="font-medium text-stone-900">Controle metier</div>
            <div className="mt-2">
              {roles.includes("MANAGER")
                ? "Manager: jusqu'a 30 jours consecutifs."
                : "Employe: jusqu'a 5 jours ouvres."}
            </div>
            <div>{validation.requestedDays} jour(s) ouvre(s) seront reserves.</div>
          </div>

          {(errorMessage || validation.errors.length > 0) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage || validation.errors[0]}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-stone-300 px-5 py-3 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={submitting || !validation.isValid}
              className="rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {submitting ? "Reservation..." : "Confirmer la reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

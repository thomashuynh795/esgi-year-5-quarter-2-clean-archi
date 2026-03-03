import { useEffect, useMemo, useState } from "react";
import ParkingGrid from "../components/ParkingGrid";
import CreateReservationModal from "../components/CreateReservationModal";
import { useAuth } from "../context/AuthContext";
import { buildMockParkingSpots, buildMockReservations } from "../domain/mock";
import type { DailyOccupancyViewModel, ParkingSpot, ParkingSpotViewModel, ReservationDraft, ReservationViewModel } from "../domain/models";
import { formatDateInput, getSpotStatus, isElectricRow } from "../domain/parkingRules";
import { ParkingService } from "../services/ParkingService";
import { ApiError } from "../services/api";

function buildInitialDraft(vehicleType: ReservationDraft["vehicleType"]): ReservationDraft {
  const today = formatDateInput(new Date());
  return {
    spotId: "",
    startDate: today,
    endDate: today,
    slot: "AM",
    vehicleType,
    needsCharge: vehicleType === "ELECTRIC",
  };
}

export default function Parking() {
  const { user } = useAuth();
  const [draft, setDraft] = useState<ReservationDraft>(() =>
    buildInitialDraft(user?.vehicleType === "HYBRID" || user?.vehicleType === "ELECTRIC" ? user.vehicleType : "THERMAL"),
  );
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [occupancy, setOccupancy] = useState<DailyOccupancyViewModel>({
    date: formatDateInput(new Date()),
    spots: buildMockParkingSpots().map((spot) => ({
      spotId: spot.id,
      row: spot.row,
      number: spot.number,
      hasCharger: spot.hasCharger,
      isActive: spot.isActive,
      isAvailableAM: true,
      isAvailablePM: true,
    })),
  });
  const [myReservations, setMyReservations] = useState<ReservationViewModel[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const reservedSpotIds = useMemo(
    () =>
      new Set(
        occupancy.spots
          .filter((spot) => (draft.slot === "AM" ? !spot.isAvailableAM : !spot.isAvailablePM))
          .map((spot) => spot.spotId),
      ),
    [draft.slot, occupancy.spots],
  );

  const myReservedSpotIds = useMemo(
    () =>
      new Set(
        myReservations
          .filter(
            (reservation) =>
              reservation.date === draft.startDate &&
              reservation.slot === draft.slot &&
              reservation.status !== "CANCELLED",
          )
          .map((reservation) => reservation.spotId),
      ),
    [draft.slot, draft.startDate, myReservations],
  );

  const viewSpots = useMemo<ParkingSpotViewModel[]>(
    () =>
      spots.map((spot) => {
        const dailyOccupancy = occupancy.spots.find((entry) => entry.spotId === spot.id);
        const status = getSpotStatus({
          spot,
          draft,
          reservedSpotIds,
          myReservedSpotIds,
        });

        const statusLabelMap: Record<ParkingSpotViewModel["status"], string> = {
          available: "Disponible",
          reserved: "Reservee",
          reservedByMe: "Ma reservation",
          unavailable: "Indisponible",
        };

        const isAvailableAM = dailyOccupancy?.isAvailableAM ?? true;
        const isAvailablePM = dailyOccupancy?.isAvailablePM ?? true;
        const isThermalVehicle = draft.vehicleType === "THERMAL";

        let tileTone: ParkingSpotViewModel["tileTone"] | undefined;
        let badgeLabel: ParkingSpotViewModel["badgeLabel"];

        if (isThermalVehicle && spot.hasCharger) {
          tileTone = "dashboardBlocked";
        } else if (isAvailableAM && isAvailablePM) {
          tileTone = "dashboardAvailable";
        } else if (isAvailableAM && !isAvailablePM) {
          tileTone = "dashboardPartial";
          badgeLabel = "AM";
        } else if (!isAvailableAM && isAvailablePM) {
          tileTone = "dashboardPartial";
          badgeLabel = "PM";
        } else {
          tileTone = "dashboardUnavailable";
        }

        return {
          ...spot,
          status,
          statusLabel: statusLabelMap[status],
          typeLabel: isElectricRow(spot.row) ? "Electric" : "Standard",
          tileTone,
          badgeLabel,
          hideChargerBadge: Boolean(tileTone),
        };
      }),
    [draft, myReservedSpotIds, occupancy.spots, reservedSpotIds, spots],
  );

  const selectedSpot = useMemo(
    () => spots.find((spot) => spot.id === selectedSpotId) ?? null,
    [selectedSpotId, spots],
  );

  async function loadParkingPage() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const [spotResults, occupancyResults, reservationResults] = await Promise.all([
        ParkingService.getAllSpots().catch(() => buildMockParkingSpots()),
        ParkingService.getDailyOccupancy(draft.startDate).catch(() => ({
          date: draft.startDate,
          spots: buildMockParkingSpots().map((spot) => ({
            spotId: spot.id,
            row: spot.row,
            number: spot.number,
            hasCharger: spot.hasCharger,
            isActive: spot.isActive,
            isAvailableAM: true,
            isAvailablePM: true,
          })),
        })),
        ParkingService.getMyReservations().catch(() => buildMockReservations()),
      ]);

      setSpots(spotResults);
      setOccupancy(occupancyResults);
      setMyReservations(reservationResults);
    } catch (error) {
      setSpots(buildMockParkingSpots());
      setOccupancy({
        date: draft.startDate,
        spots: buildMockParkingSpots().map((spot) => ({
          spotId: spot.id,
          row: spot.row,
          number: spot.number,
          hasCharger: spot.hasCharger,
          isActive: spot.isActive,
          isAvailableAM: true,
          isAvailablePM: true,
        })),
      });
      setMyReservations(buildMockReservations());
      setErrorMessage(
        error instanceof ApiError
          ? `${error.message} Les donnees affichees sont mockees.`
          : "Le parking n'a pas pu etre charge. Les donnees mockees sont affichees.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadParkingPage();
  }, [draft.slot, draft.startDate]);

  if (!user) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[2rem] bg-stone-900 px-6 py-8 text-white shadow-lg">
          <div className="text-sm uppercase tracking-[0.35em] text-emerald-200">Parking Reservation System</div>
          <h1 className="mt-4 max-w-xl font-serif text-4xl font-semibold">
            Reservez simplement une place, sans jargon technique.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-300">
            60 places de A01 a F10. Les rangees A et F sont equipees de chargeurs et reservees
            aux vehicules electriques ou hybrides.
          </p>
        </div>

        <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm">
          <div className="text-sm uppercase tracking-[0.3em] text-stone-500">Contexte de reservation</div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Date</span>
              <input
                type="date"
                min={formatDateInput(new Date())}
                value={draft.startDate}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    startDate: event.target.value,
                    endDate: event.target.value > current.endDate ? event.target.value : current.endDate,
                  }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Slot</span>
              <select
                value={draft.slot}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, slot: event.target.value as "AM" | "PM" }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              >
                <option value="AM">AM · Matin</option>
                <option value="PM">PM · Apres-midi</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm font-medium text-stone-700">Type de vehicule</span>
              <select
                value={draft.vehicleType}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    vehicleType: event.target.value as ReservationDraft["vehicleType"],
                    needsCharge: event.target.value === "THERMAL" ? false : current.needsCharge,
                  }))
                }
                className="w-full rounded-2xl border border-stone-200 px-4 py-3"
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
                className="h-4 w-4"
              />
              <span>
                <span className="block text-sm font-medium text-stone-800">Besoin de charge</span>
                <span className="block text-xs text-stone-600">Limite aux rangees A et F</span>
              </span>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-800">Vert: AM + PM dispo</span>
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-800">AM: matin dispo</span>
            <span className="rounded-full bg-emerald-100 px-3 py-2 text-emerald-800">PM: apres-midi dispo</span>
            <span className="rounded-full bg-rose-100 px-3 py-2 text-rose-800">Rouge: complet</span>
            <span className="rounded-full bg-stone-200 px-3 py-2 text-stone-700">Gris: borne non compatible</span>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {errorMessage}
        </div>
      )}

      <section className="mt-8">
        {loading ? (
          <div className="rounded-[2rem] border border-stone-200 bg-white p-10 text-center text-stone-600 shadow-sm">
            Chargement du plan du parking...
          </div>
        ) : (
          <ParkingGrid
            spots={viewSpots}
            selectedSpotId={selectedSpotId ?? undefined}
            onSpotClick={(spotId) => {
              setSelectedSpotId(spotId);
              setIsModalOpen(true);
            }}
          />
        )}
      </section>

      <CreateReservationModal
        isOpen={isModalOpen}
        spot={selectedSpot}
        roles={user.roles}
        initialDraft={{ ...draft, spotId: selectedSpot?.id ?? draft.spotId }}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadParkingPage}
      />
    </div>
  );
}

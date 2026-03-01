import type { ParkingSpotViewModel } from "../domain/models";

const stateClasses: Record<ParkingSpotViewModel["status"], string> = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100",
  reserved: "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300",
  reservedByMe: "border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-400 hover:bg-sky-100",
  unavailable: "border-stone-200 bg-stone-100 text-stone-500 hover:border-stone-300",
};

interface ParkingSpotTileProps {
  spot: ParkingSpotViewModel;
  selected?: boolean;
  onClick: (spotId: string) => void;
}

export default function ParkingSpotTile({ spot, selected, onClick }: ParkingSpotTileProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(spot.id)}
      className={`relative flex min-h-[72px] flex-col justify-between rounded-xl border px-2.5 py-2 text-left shadow-sm transition ${stateClasses[spot.status]} ${
        selected ? "ring-2 ring-stone-900 ring-offset-2" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold leading-none">{spot.id}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-current/70">R {spot.row}</div>
        </div>
        {spot.hasCharger && (
          <span
            className="rounded-full border border-current/10 bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
            title="Chargeur disponible"
          >
            EV
          </span>
        )}
      </div>

      <div className="space-y-0.5">
        <div className="text-[11px] font-medium leading-tight">{spot.statusLabel}</div>
        <div className="text-[10px] text-current/70">{spot.typeLabel}</div>
      </div>
    </button>
  );
}

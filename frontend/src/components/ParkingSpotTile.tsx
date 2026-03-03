import type { ParkingSpotViewModel } from "../domain/models";

const stateClasses = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100",
  reserved: "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300",
  reservedByMe: "border-sky-200 bg-sky-50 text-sky-900 hover:border-sky-400 hover:bg-sky-100",
  unavailable: "border-stone-200 bg-stone-100 text-stone-500 hover:border-stone-300",
  dashboardAvailable:
    "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100",
  dashboardPartial:
    "border-emerald-200 bg-emerald-50 text-emerald-900 hover:border-emerald-400 hover:bg-emerald-100",
  dashboardUnavailable: "border-rose-200 bg-rose-50 text-rose-800 hover:border-rose-300",
  dashboardBlocked: "border-stone-300 bg-stone-200 text-stone-600 hover:border-stone-400",
} satisfies Record<NonNullable<ParkingSpotViewModel["tileTone"]>, string>;

interface ParkingSpotTileProps {
  spot: ParkingSpotViewModel;
  selected?: boolean;
  onClick?: (spotId: string) => void;
}

export default function ParkingSpotTile({ spot, selected, onClick }: ParkingSpotTileProps) {
  const tileTone = spot.tileTone ?? spot.status;
  const isInteractive = typeof onClick === "function";

  return (
    <button
      type="button"
      onClick={() => onClick?.(spot.id)}
      disabled={!isInteractive}
      className={`relative flex min-h-[72px] flex-col justify-between rounded-xl border px-2.5 py-2 text-left shadow-sm transition ${stateClasses[tileTone]} ${
        selected ? "ring-2 ring-stone-900 ring-offset-2" : ""
      } ${
        isInteractive ? "" : "cursor-default"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold leading-none">{spot.id}</div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.18em] text-current/70">R {spot.row}</div>
        </div>
        {spot.badgeLabel ? (
          <span className="min-w-7 rounded-full bg-emerald-900 px-1.5 py-0.5 text-center text-[9px] font-semibold uppercase tracking-[0.18em] text-white">
            {spot.badgeLabel}
          </span>
        ) : !spot.hideChargerBadge && spot.hasCharger ? (
          <span
            className="rounded-full border border-current/10 bg-white/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]"
            title="Chargeur disponible"
          >
            EV
          </span>
        ) : null}
      </div>

      <div className="space-y-0.5">
        <div className="text-[11px] font-medium leading-tight">{spot.statusLabel}</div>
        <div className="text-[10px] text-current/70">{spot.typeLabel}</div>
      </div>
    </button>
  );
}

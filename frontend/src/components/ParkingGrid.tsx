import type { ParkingSpotViewModel } from "../domain/models";
import { PARKING_ROWS } from "../domain/parkingRules";
import ParkingSpotTile from "./ParkingSpotTile";

interface ParkingGridProps {
  spots: ParkingSpotViewModel[];
  selectedSpotId?: string;
  onSpotClick: (spotId: string) => void;
}

export default function ParkingGrid({ spots, selectedSpotId, onSpotClick }: ParkingGridProps) {
  return (
    <div className="space-y-4">
      {PARKING_ROWS.map((row) => {
        const rowSpots = spots
          .filter((spot) => spot.row === row)
          .sort((left, right) => left.number - right.number);

        return (
          <section key={row} className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-lg font-semibold text-stone-900">Rangee {row}</h2>
                <p className="text-xs text-stone-600">
                  {row === "A" || row === "F"
                    ? "Mur + bornes de charge. Reserve aux vehicules electriques et hybrides."
                    : "Places standards."}
                </p>
              </div>
              <div className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-stone-600">
                {rowSpots.length} places
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-10">
              {rowSpots.map((spot) => (
                <ParkingSpotTile
                  key={spot.id}
                  spot={spot}
                  selected={spot.id === selectedSpotId}
                  onClick={onSpotClick}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

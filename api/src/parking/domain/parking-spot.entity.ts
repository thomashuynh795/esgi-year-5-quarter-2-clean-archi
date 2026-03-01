import { ParkingSpotId } from '../../reservation/domain/classes/parking-spot-id.class';

export class ParkingSpot {
  id!: ParkingSpotId;
  row!: string;
  number!: number;
  hasCharger!: boolean;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<ParkingSpot>) {
    Object.assign(this, partial);
  }

  public isElectric(): boolean {
    return this.hasCharger;
  }

  public isRowElectric(row: string): boolean {
    return ['A', 'F'].includes(row.toUpperCase());
  }

  public validate(): void {
    if (this.isRowElectric(this.row) && !this.hasCharger) {
      throw new Error('Spots in rows A and F must have a charger.');
    }
    if (!this.isRowElectric(this.row) && this.hasCharger) {
      throw new Error('Only spots in rows A and F can have a charger.');
    }
  }
}

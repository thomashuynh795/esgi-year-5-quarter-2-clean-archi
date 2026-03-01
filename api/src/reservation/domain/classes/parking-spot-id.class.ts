export class ParkingSpotId {
  private constructor(public readonly value: string) {}

  static of(raw: string): ParkingSpotId {
    if (!/^[A-F](0[1-9]|10)$/.test(raw)) {
      throw new Error(`Invalid ParkingSpotId: ${raw}`);
    }
    return new ParkingSpotId(raw);
  }
}

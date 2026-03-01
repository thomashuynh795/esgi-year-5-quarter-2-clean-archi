export class ReservationPeriod {
  private constructor(
    public readonly start: Date,
    public readonly end: Date,
  ) {}

  static of(start: Date, end: Date): ReservationPeriod {
    const startMidnight = new Date(start);
    startMidnight.setHours(0, 0, 0, 0);

    const endMidnight = new Date(end);
    endMidnight.setHours(0, 0, 0, 0);

    if (endMidnight < startMidnight) {
      throw new Error('End date must be >= start date');
    }

    return new ReservationPeriod(startMidnight, endMidnight);
  }
}

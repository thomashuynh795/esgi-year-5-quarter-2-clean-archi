import { Reservation } from '../../domain/classes/reservation.class';
import { ReservationRepository } from '../../domain/reservation.repository';

export class GetReservationsForMonthUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  public async execute(year: number, month: number): Promise<Reservation[]> {
    return this.reservationRepository.findReservationsForMonth(year, month);
  }
}

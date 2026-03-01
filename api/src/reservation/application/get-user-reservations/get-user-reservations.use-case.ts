import { Reservation } from '../../domain/classes/reservation.class';
import { ReservationRepository } from '../../domain/reservation.repository';

export class GetUserReservationsUseCase {
  public constructor(
    private readonly reservationRepository: ReservationRepository,
  ) {}

  public async execute(userId: string): Promise<Reservation[]> {
    return this.reservationRepository.findByUser(userId);
  }
}

import { Request, Response } from 'express';
import { MakeReservation } from '../../../application/use-cases/MakeReservation';
import { GetUserReservations } from '../../../application/use-cases/GetUserReservations';
import { CancelReservation } from '../../../application/use-cases/CancelReservation';
import { PrismaReservationRepository } from '../../../infrastructure/repositories/PrismaReservationRepository';
import { PrismaParkingSlotRepository } from '../../../infrastructure/repositories/PrismaParkingSlotRepository';

export class ReservationController {
    async create(req: Request, res: Response) {
        const { userId, slotId, date } = req.body;

        const reservationRepository = new PrismaReservationRepository();
        const parkingSlotRepository = new PrismaParkingSlotRepository();
        const useCase = new MakeReservation(reservationRepository, parkingSlotRepository);

        try {
            const reservation = await useCase.execute(
                Number(userId),
                Number(slotId),
                new Date(date)
            );
            res.json(reservation);
        } catch (error: any) {
            console.error(error);
            res.status(400).json({ error: error.message || 'Error creating reservation' });
        }
    }

    async getByUser(req: Request, res: Response) {
        const { userId } = req.params;

        const reservationRepository = new PrismaReservationRepository();
        const useCase = new GetUserReservations(reservationRepository);

        try {
            const reservations = await useCase.execute(Number(userId));
            res.json(reservations);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async checkIn(req: Request, res: Response) {
        const { reservationId } = req.body;
        const reservationRepository = new PrismaReservationRepository();

        // Small hack: direct usage or use case? Use case is better.
        // But I need to import it.
        const { CheckIn } = await import('../../../application/use-cases/CheckIn');
        const useCase = new CheckIn(reservationRepository);

        try {
            const reservation = await useCase.execute(Number(reservationId));
            res.json(reservation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async cancelUnconfirmed(req: Request, res: Response) {
        // This is a "job" trigger
        const reservationRepository = new PrismaReservationRepository();
        const { CancelUnconfirmedReservations } = await import('../../../application/use-cases/CancelUnconfirmedReservations');
        const useCase = new CancelUnconfirmedReservations(reservationRepository);

        try {
            // Assume job runs for "now"
            await useCase.execute(new Date());
            res.json({ message: 'Job executed' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    async cancel(req: Request, res: Response) {
        const { reservationId } = req.body;
        const reservationRepository = new PrismaReservationRepository();
        const useCase = new CancelReservation(reservationRepository);

        try {
            const reservation = await useCase.execute(Number(reservationId));
            res.json(reservation);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

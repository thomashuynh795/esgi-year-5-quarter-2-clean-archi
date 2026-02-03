import { Request, Response } from 'express';
import { GetAvailableSlots } from '../../../application/use-cases/GetAvailableSlots';
import { PrismaParkingSlotRepository } from '../../../infrastructure/repositories/PrismaParkingSlotRepository';
import { PrismaReservationRepository } from '../../../infrastructure/repositories/PrismaReservationRepository';

export class ParkingSlotController {
    async getAvailable(req: Request, res: Response) {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const reservationRepository = new PrismaReservationRepository();
        const parkingSlotRepository = new PrismaParkingSlotRepository();
        const useCase = new GetAvailableSlots(parkingSlotRepository, reservationRepository);

        try {
            const slots = await useCase.execute(new Date(date as string));
            res.json(slots);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
}

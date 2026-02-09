import axios from 'axios';
import { ParkingSlot, Reservation } from '../domain/models';

export class ParkingService {
    private static BASE_URL = 'http://localhost:3000/api';

    static async getAvailableSlots(date: string, period: 'AM' | 'PM', duration: number): Promise<ParkingSlot[]> {
        const res = await axios.get(`${this.BASE_URL}/slots`, {
            params: { date, period, duration }
        });
        return res.data;
    }

    static async getUserReservations(userId: number): Promise<Reservation[]> {
        const res = await axios.get(`${this.BASE_URL}/reservations/user/${userId}`);
        return res.data;
    }

    static async createReservation(
        userId: number,
        slotId: number,
        date: string,
        period: 'AM' | 'PM',
        duration: number,
        needsCharging: boolean
    ): Promise<void> {
        await axios.post(`${this.BASE_URL}/reservations`, {
            userId,
            slotId,
            date,
            period,
            duration,
            needsCharging
        });
    }

    static async checkIn(reservationId: number): Promise<void> {
        await axios.post(`${this.BASE_URL}/reservations/checkin`, { reservationId });
    }

    static async cancelReservation(reservationId: number): Promise<void> {
        await axios.post(`${this.BASE_URL}/reservations/cancel`, { reservationId });
    }
}

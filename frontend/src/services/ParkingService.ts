import axios from 'axios';
import { ParkingSlot, Reservation } from '../domain/models';

export class ParkingService {
    private static BASE_URL = 'http://localhost:8080';

    private static getHeaders() {
        const token = localStorage.getItem('token');
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    }

    static async getAvailableSlots(date: string, period: 'AM' | 'PM', duration: number): Promise<ParkingSlot[]> {
        const res = await axios.get(`${this.BASE_URL}/parking/slots/available`, {
            params: { date, period, duration },
            ...this.getHeaders()
        });
        return res.data;
    }

    static async getUserReservations(userId: number): Promise<Reservation[]> {
        const res = await axios.get(`${this.BASE_URL}/parking/reservations/user/${userId}`, this.getHeaders());
        return res.data;
    }

    static async createReservation(
        slotId: number,
        date: string,
        period: 'AM' | 'PM',
        duration: number,
        needsCharging: boolean
    ): Promise<void> {
        await axios.post(
            `${this.BASE_URL}/parking/reservations`,
            {
                slotId,
                startDate: date,
                period,
                duration,
                needsCharging
            },
            this.getHeaders()
        );
    }

    static async checkIn(reservationId: number): Promise<void> {
        await axios.post(`${this.BASE_URL}/parking/reservations/${reservationId}/check-in`, {}, this.getHeaders());
    }

    static async cancelReservation(reservationId: number): Promise<void> {
        await axios.delete(`${this.BASE_URL}/parking/reservations/${reservationId}`, this.getHeaders());
    }
}

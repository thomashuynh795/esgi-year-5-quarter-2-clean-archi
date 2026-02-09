import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ParkingSlot, Reservation, GroupedReservation } from '../domain/models';
import { ParkingService } from '../services/ParkingService';

const groupReservations = (reservations: Reservation[]): GroupedReservation[] => {
    if (reservations.length === 0) return [];
    const sorted = [...reservations].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const groups: GroupedReservation[] = [];
    let currentGroup: GroupedReservation | null = null;

    for (const res of sorted) {
        if (!currentGroup) {
            currentGroup = {
                id: `${res.id}`,
                ids: [res.id],
                slotName: res.slot?.name || 'Unknown',
                slotId: res.slot?.id || 0,
                period: res.period,
                startDate: res.date,
                endDate: res.date,
                status: res.status
            };
        } else {
            const lastDate = new Date(currentGroup.endDate);
            const currentDate = new Date(res.date);
            const diffTime = Math.abs(currentDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const isSameSlot = res.slot?.id === currentGroup.slotId;
            const isSamePeriod = res.period === currentGroup.period;
            const isContiguous = diffDays === 1 || (diffDays <= 3 && lastDate.getDay() === 5 && currentDate.getDay() === 1);

            if (isSameSlot && isSamePeriod && isContiguous) {
                currentGroup.ids.push(res.id);
                currentGroup.endDate = res.date;
                if (res.status !== currentGroup.status) {
                    groups.push(currentGroup);
                    currentGroup = {
                        id: `${res.id}`,
                        ids: [res.id],
                        slotName: res.slot?.name || 'Unknown',
                        slotId: res.slot?.id || 0,
                        period: res.period,
                        startDate: res.date,
                        endDate: res.date,
                        status: res.status
                    };
                }
            } else {
                groups.push(currentGroup);
                currentGroup = {
                    id: `${res.id}`,
                    ids: [res.id],
                    slotName: res.slot?.name || 'Unknown',
                    slotId: res.slot?.id || 0,
                    period: res.period,
                    startDate: res.date,
                    endDate: res.date,
                    status: res.status
                };
            }
        }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
};


export const useDashboardController = () => {
    const { user, login, logout } = useAuth();
    const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [availableSlots, setAvailableSlots] = useState<ParkingSlot[]>([]);
    const [myReservations, setMyReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
    const [needsCharging, setNeedsCharging] = useState(false);
    const [duration, setDuration] = useState(1);
    const [period, setPeriod] = useState<'AM' | 'PM'>('AM');

    useEffect(() => {
        if (user) {
            fetchMyReservations();
            fetchAvailableSlots();
        }
    }, [user, date, period, duration]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const slots = await ParkingService.getAvailableSlots(date, period, duration);
            setAvailableSlots(slots);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyReservations = async () => {
        if (!user) return;
        try {
            const reservations = await ParkingService.getUserReservations(user.id);
            setMyReservations(reservations);
        } catch (e) {
            console.error(e);
        }
    };

    const bookSlot = async (slotId: number) => {
        if (!user) return;
        try {
            await ParkingService.createReservation(user.id, slotId, new Date(date).toISOString(), period, duration, needsCharging);
            alert('Reservation successful!');
            fetchAvailableSlots();
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCheckIn = async (reservationIds: number[]) => {
        // Find reservation ID for today
        const today = new Date().toISOString().split('T')[0];
        const todaysReservation = myReservations.find(r => reservationIds.includes(r.id) && new Date(r.date).toISOString().split('T')[0] === today);

        if (!todaysReservation) {
            alert('No reservation for today to check-in.');
            return;
        }

        try {
            await ParkingService.checkIn(todaysReservation.id);
            alert('Check-in confirmed!');
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const handleCancel = async (reservationIds: number[]) => {
        if (!confirm(`Are you sure you want to cancel ${reservationIds.length} day(s)?`)) return;
        try {
            for (const id of reservationIds) {
                await ParkingService.cancelReservation(id);
            }
            alert('Reservation(s) cancelled!');
            fetchAvailableSlots();
            fetchMyReservations();
        } catch (e: any) {
            alert('Error: ' + (e.response?.data?.error || e.message));
        }
    };

    const switchUser = async (email: string) => {
        await login(email);
    };

    const groupedReservations = groupReservations(myReservations);

    return {
        user,
        logout,
        switchUser,
        date,
        setDate,
        availableSlots,
        loading,
        needsCharging,
        setNeedsCharging,
        duration,
        setDuration,
        period,
        setPeriod,
        bookSlot,
        handleCheckIn,
        handleCancel,
        groupedReservations,
        myReservations
    };
};

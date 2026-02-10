export interface ParkingSlot {
    id: number;
    name: string;
    row: string;
    type: string;
    isReserved: boolean;
}

export interface Reservation {
    id: number;
    date: string;
    status: string;
    period: 'AM' | 'PM';
    slot: { id: number; name: string };
}

export interface GroupedReservation {
    id: string; // Composite ID for key
    ids: number[]; // All reservation IDs
    slotName: string;
    slotId: number;
    period: 'AM' | 'PM';
    startDate: string;
    endDate: string;
    status: string;
}

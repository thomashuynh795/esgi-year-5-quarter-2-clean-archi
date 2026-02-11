
export enum SlotType {
    STANDARD = 'STANDARD',
    ELECTRIC = 'ELECTRIC'
}

export class ParkingSlot {
    constructor(
        public readonly id: number,
        public readonly name: string,
        public readonly row: string,
        public readonly number: number,
        public readonly type: SlotType,
    ) { }
}

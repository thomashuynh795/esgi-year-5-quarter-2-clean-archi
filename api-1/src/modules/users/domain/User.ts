
export enum UserRole {
    EMPLOYEE = 'EMPLOYEE',
    SECRETARY = 'SECRETARY',
    MANAGER = 'MANAGER'
}

export class User {
    constructor(
        public readonly id: number,
        public readonly email: string,
        public readonly role: UserRole,
        public readonly password?: string,
    ) { }
}

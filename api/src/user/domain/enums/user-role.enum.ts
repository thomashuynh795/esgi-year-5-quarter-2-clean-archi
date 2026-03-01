import { freezeDeeply } from '../../../shared/utils/freeze-deeply';

export const UserRole = freezeDeeply({
  Employee: 'EMPLOYEE',
  Manager: 'MANAGER',
  Secretary: 'SECRETARY',
} as const);

export type UserRole = (typeof UserRole)[keyof typeof UserRole];

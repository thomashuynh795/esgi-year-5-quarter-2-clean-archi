import { Token } from '../token';

export const AUTH_PORT = Symbol('AUTH_PORT');

export interface AuthPort {
  logIn(email: string, password: string): Promise<Token>;
}

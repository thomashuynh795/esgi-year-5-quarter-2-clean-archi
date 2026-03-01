export const PASSWORD_PORT = Symbol('PASSWORD_PORT');

export interface PasswordPort {
  hashPassword(password: string): Promise<string>;
  isPasswordCorrect(password: string, hashedPassword: string): Promise<boolean>;
  generateRandomTemporaryPassword(length: number): string;
}

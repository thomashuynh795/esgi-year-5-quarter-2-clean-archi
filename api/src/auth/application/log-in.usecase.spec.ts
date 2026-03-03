import type { AuthPort } from '../domain/ports/auth.port';
import { LogInUseCase } from './log-in.usecase';

describe('LogInUseCase', () => {
  it('delegates login to the auth port', async () => {
    const token = 'jwt-token' as never;
    const authPort: AuthPort = {
      logIn: jest.fn().mockResolvedValue(token),
    };

    const useCase = new LogInUseCase(authPort);

    await expect(useCase.execute('john@example.com', 'secret')).resolves.toBe(
      token,
    );
    expect(authPort.logIn).toHaveBeenCalledWith('john@example.com', 'secret');
  });
});

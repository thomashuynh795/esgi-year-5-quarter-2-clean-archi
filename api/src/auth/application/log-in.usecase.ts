import { AuthPort } from '../domain/ports/auth.port';
import { Token } from '../domain/token';

export class LogInUseCase {
  public constructor(private readonly authRepository: AuthPort) {}

  public async execute(email: string, password: string): Promise<Token> {
    return this.authRepository.logIn(email, password);
  }
}

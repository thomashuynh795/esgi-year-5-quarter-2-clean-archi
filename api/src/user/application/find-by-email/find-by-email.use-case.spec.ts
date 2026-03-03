import type { UserRepository } from '../../domain/user.repository';
import { makeUser } from '../../../test-utils/factories';
import { FindUserByEmailUseCase } from './find-by-email.use-case';

describe('FindUserByEmailUseCase', () => {
  it('returns the matching user', async () => {
    const user = makeUser();
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn().mockResolvedValue(user),
      findAll: jest.fn(),
    };

    const useCase = new FindUserByEmailUseCase(userRepository);

    await expect(useCase.execute('user@example.com')).resolves.toBe(user);
  });
});

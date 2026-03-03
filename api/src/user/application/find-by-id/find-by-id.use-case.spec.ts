import type { UserRepository } from '../../domain/user.repository';
import { makeUser } from '../../../test-utils/factories';
import { FindUserByIdUseCase } from './find-by-id.use-case';

describe('FindUserByIdUseCase', () => {
  it('returns the matching user', async () => {
    const user = makeUser();
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(user),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new FindUserByIdUseCase(userRepository);

    await expect(useCase.execute('user-1')).resolves.toBe(user);
  });
});

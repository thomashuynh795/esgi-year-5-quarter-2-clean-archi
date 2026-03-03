import type { UserRepository } from '../../domain/user.repository';
import { makeUser } from '../../../test-utils/factories';
import { FindAllEmployeesUseCase } from './find-all-employees.use-case';

describe('FindAllEmployeesUseCase', () => {
  it('returns all users from the repository', async () => {
    const users = [makeUser(), makeUser({ id: 'user-2', email: 'two@example.com' })];
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn().mockResolvedValue(users),
    };

    const useCase = new FindAllEmployeesUseCase(userRepository);

    await expect(useCase.execute()).resolves.toBe(users);
  });
});

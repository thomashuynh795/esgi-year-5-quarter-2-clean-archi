import { NotFoundException } from '../../shared/error/domain/not-found.exception';
import { UserRole } from '../../user/domain/enums/user-role.enum';
import type { UserRepository } from '../../user/domain/user.repository';
import { makeUser } from '../../test-utils/factories';
import { GetRoleFromUserIdUseCase } from './get-role-from-user-id.usecase';

describe('GetRoleFromUserIdUseCase', () => {
  it('returns roles for an existing user', async () => {
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(
        makeUser({ roles: [UserRole.Employee, UserRole.Manager] }),
      ),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new GetRoleFromUserIdUseCase(userRepository);

    await expect(useCase.execute('user-1')).resolves.toEqual([
      UserRole.Employee,
      UserRole.Manager,
    ]);
  });

  it('throws when the user does not exist', async () => {
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new GetRoleFromUserIdUseCase(userRepository);

    await expect(useCase.execute('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});

import { BadRequestException } from '../../../shared/error/domain/bad-request.exception';
import { NotFoundException } from '../../../shared/error/domain/not-found.exception';
import { makeUser } from '../../../test-utils/factories';
import { UserRole } from '../../domain/enums/user-role.enum';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import type { UserRepository } from '../../domain/user.repository';
import { UpdateUserUseCase } from './update-user.use-case';

describe('UpdateUserUseCase', () => {
  it('allows a secretary to update a user', async () => {
    const actor = makeUser({ id: 'secretary', roles: [UserRole.Secretary] });
    const target = makeUser({ id: 'user-2', firstName: 'Old' });
    const userRepository: UserRepository = {
      save: jest.fn().mockImplementation(async (user) => user),
      findById: jest
        .fn()
        .mockResolvedValueOnce(actor)
        .mockResolvedValueOnce(target),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new UpdateUserUseCase(userRepository);
    const result = await useCase.execute({
      actorId: 'secretary',
      userId: 'user-2',
      firstName: 'New',
      vehicleType: VehicleType.Electric,
    });

    expect(result.firstName).toBe('New');
    expect(result.vehicleType).toBe(VehicleType.Electric);
    expect(userRepository.save).toHaveBeenCalled();
  });

  it('rejects non-admin actors', async () => {
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest.fn().mockResolvedValue(makeUser()),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new UpdateUserUseCase(userRepository);

    await expect(
      useCase.execute({ actorId: 'user-1', userId: 'user-2' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when the target user does not exist', async () => {
    const userRepository: UserRepository = {
      save: jest.fn(),
      findById: jest
        .fn()
        .mockResolvedValueOnce(
          makeUser({ id: 'manager', roles: [UserRole.Manager] }),
        )
        .mockResolvedValueOnce(null),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new UpdateUserUseCase(userRepository);

    await expect(
      useCase.execute({ actorId: 'manager', userId: 'missing' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

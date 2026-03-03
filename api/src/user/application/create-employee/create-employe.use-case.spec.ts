import { UserRole } from '../../domain/enums/user-role.enum';
import { VehicleType } from '../../domain/enums/vehicle-type.enum';
import type { UserRepository } from '../../domain/user.repository';
import { CreateEmployeeUseCase } from './create-employe.use-case';

describe('CreateEmployeeUseCase', () => {
  it('creates an employee with the expected defaults', async () => {
    const userRepository: UserRepository = {
      save: jest.fn().mockImplementation(async (user) => user),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
    };

    const useCase = new CreateEmployeeUseCase(userRepository);
    const result = await useCase.execute(
      'john@example.com',
      'John',
      'Doe',
      VehicleType.Hybrid,
    );

    expect(result.email).toBe('john@example.com');
    expect(result.roles).toEqual([UserRole.Employee]);
    expect(result.vehicleType).toBe(VehicleType.Hybrid);
    expect(userRepository.save).toHaveBeenCalled();
  });
});

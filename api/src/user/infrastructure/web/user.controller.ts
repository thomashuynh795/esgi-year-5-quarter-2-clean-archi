import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Patch,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwtAuthGuard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../domain/enums/user-role.enum';
import { CreateEmployeeUseCase } from '../../application/create-employee/create-employe.use-case';
import { CreateEmployeeRequest } from './dtos/create-employee.request';
import { FindAllEmployeesUseCase } from '../../application/find-all-employees/find-all-employees.use-case';
import { FindUserByIdUseCase } from '../../application/find-by-id/find-by-id.use-case';
import { FindUserByEmailUseCase } from '../../application/find-by-email/find-by-email.use-case';
import { UpdateUserUseCase } from '../../application/update-user/update-user.use-case';
import { UpdateUserRequest } from './dtos/update-user.request';
import type { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  public constructor(
    private readonly createEmployeeUseCase: CreateEmployeeUseCase,
    private readonly findAllEmployeesUseCase: FindAllEmployeesUseCase,
    private readonly findUserByIdUseCase: FindUserByIdUseCase,
    private readonly findUserByEmailUseCase: FindUserByEmailUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Post()
  @Roles(UserRole.Manager, UserRole.Secretary)
  public async createUser(@Body() createUserDto: CreateEmployeeRequest) {
    return this.createEmployeeUseCase.execute(
      createUserDto.email,
      createUserDto.firstName,
      createUserDto.lastName,
      createUserDto.vehicleType,
    );
  }

  @Get()
  @Roles(UserRole.Manager, UserRole.Secretary)
  public async findAll() {
    return this.findAllEmployeesUseCase.execute();
  }

  @Get(':id')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async findById(@Param('id') id: string) {
    return this.findUserByIdUseCase.execute(id);
  }

  @Get('by-email/:email')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async findByEmail(@Param('email') email: string) {
    return this.findUserByEmailUseCase.execute(email);
  }

  @Patch(':id')
  @Roles(UserRole.Manager, UserRole.Secretary)
  public async updateUser(
    @Req() req: CustomizedExpressRequest,
    @Param('id') id: string,
    @Body() dto: UpdateUserRequest,
  ) {
    return this.updateUserUseCase.execute({
      actorId: req.user.id,
      userId: id,
      firstName: dto.firstName,
      lastName: dto.lastName,
      roles: dto.roles,
      vehicleType: dto.vehicleType,
      isActive: dto.isActive,
    });
  }
}

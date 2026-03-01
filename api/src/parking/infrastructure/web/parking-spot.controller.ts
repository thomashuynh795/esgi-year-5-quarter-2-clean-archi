import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwtAuthGuard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { FindAllParkingSpotsUseCase } from '../../application/find-all-parking-spots/find-all-parking-spots.use-case';
import { FindSpotByIdUseCase } from '../../application/find-spot-by-id/find-spot-by-id.use-case';
import { ParkingSpot } from '../../domain/parking-spot.entity';
import { GetElectricSpotsUseCase } from '../../application/get-electric-spots/get-electric-spots.use-case';

@Controller('parking-spots')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ParkingSpotController {
  public constructor(
    private readonly findAllParkingSpotsUseCase: FindAllParkingSpotsUseCase,
    private readonly findSpotByIdUseCase: FindSpotByIdUseCase,
    private readonly getElectricSpotsUseCase: GetElectricSpotsUseCase,
  ) {}

  @Get()
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async findAll(): Promise<ParkingSpot[]> {
    return await this.findAllParkingSpotsUseCase.execute();
  }

  @Get('electric')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async getElectricSpots(): Promise<ParkingSpot[]> {
    return await this.getElectricSpotsUseCase.execute();
  }

  @Get(':id')
  @Roles(UserRole.Employee, UserRole.Manager, UserRole.Secretary)
  public async findById(@Param('id') id: string): Promise<ParkingSpot> {
    return await this.findSpotByIdUseCase.execute(id);
  }
}

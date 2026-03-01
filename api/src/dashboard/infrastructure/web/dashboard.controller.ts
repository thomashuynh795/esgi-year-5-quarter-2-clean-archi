import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { GetStatisticsUseCase } from '../../application/get-statistics/get-statistics.use-case';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwtAuthGuard';
import { RolesGuard } from '../../../auth/infrastructure/guards/roles.guard';
import { Roles } from '../../../auth/infrastructure/decorators/roles.decorator';
import { UserRole } from '../../../user/domain/enums/user-role.enum';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DashboardController {
  public constructor(private readonly dashboardService: GetStatisticsUseCase) {}

  @Get('statistics/:date')
  @Roles(UserRole.Manager)
  public async getStatistics(@Param('date') dateString: string) {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new HttpException(
        'Invalid date format. Use ISO format.',
        HttpStatus.BAD_REQUEST,
      );
    }
    return this.dashboardService.execute(date);
  }
}

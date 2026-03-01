import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LogInRequestDto } from './dto/log-in-request.dto';
import { LogInUseCase } from '../../application/log-in.usecase';
import { JwtAuthGuard } from '../guards/jwtAuthGuard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { GetRoleFromUserIdUseCase } from '../../application/get-role-from-user-id.usecase';
import { ConfigService } from '@nestjs/config';
import { ErrorHandlerService } from '../../../shared/error/infrastructure/error-handler.service';
import type { CustomizedExpressRequest } from '../../../shared/types/customized-express-request';
import { UserRole } from '../../../user/domain/enums/user-role.enum';
import { LogInResponseDto } from './dto/log-in-response.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  public constructor(
    private readonly configService: ConfigService,
    private readonly errorHandlerService: ErrorHandlerService,
    private readonly logInUseCase: LogInUseCase,
    private readonly getRoleFromUserIdUseCase: GetRoleFromUserIdUseCase,
  ) {}

  @Post('login')
  @ApiOperation({ summary: 'Log in' })
  @ApiResponse({ status: 200, description: 'OK', type: LogInResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  public async logIn(
    @Body() dto: LogInRequestDto,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const jwt: string = await this.logInUseCase.execute(
        dto.email,
        dto.password,
      );
      return response.status(HttpStatus.OK).json({ jwt });
    } catch (error: unknown) {
      return this.errorHandlerService.getErrorForControllerLayer(
        error instanceof Error ? error : new Error('Unknown error'),
        response,
      );
    }
  }

  @Get('verify-token')
  @UseGuards(JwtAuthGuard)
  public verifyToken(@Res() response: Response): Response {
    try {
      return response.status(HttpStatus.OK).json({ isJwtValid: true });
    } catch (error: unknown) {
      return this.errorHandlerService.getErrorForControllerLayer(
        error instanceof Error ? error : new Error('Unknown error'),
        response,
      );
    }
  }

  @Get('get-role')
  @UseGuards(JwtAuthGuard)
  public async getRoleFromUserId(
    @Req() request: CustomizedExpressRequest,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const roles: UserRole[] = await this.getRoleFromUserIdUseCase.execute(
        request.user.id,
      );
      return response.status(HttpStatus.OK).json({ roles });
    } catch (error: unknown) {
      return this.errorHandlerService.getErrorForControllerLayer(
        error instanceof Error ? error : new Error('Unknown error'),
        response,
      );
    }
  }

  @Get('protected-healthcheck')
  @UseGuards(JwtAuthGuard)
  public async protectedHealthcheck(
    @Req() request: CustomizedExpressRequest,
    @Res() response: Response,
  ): Promise<Response> {
    try {
      const roles = await this.getRoleFromUserIdUseCase.execute(
        request.user.id,
      );
      return response.status(HttpStatus.OK).json({ roles });
    } catch (error: unknown) {
      return this.errorHandlerService.getErrorForControllerLayer(
        error instanceof Error ? error : new Error('Unknown error'),
        response,
      );
    }
  }

  @Get('employee-protected-healthcheck')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Employee)
  public employeeProtectedHealthcheck(@Res() response: Response): Response {
    try {
      return response.status(HttpStatus.OK).json({ message: 'OK' });
    } catch (error: unknown) {
      return this.errorHandlerService.getErrorForControllerLayer(
        error instanceof Error ? error : new Error('Unknown error'),
        response,
      );
    }
  }
}

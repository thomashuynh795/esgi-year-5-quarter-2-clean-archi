import { Module } from '@nestjs/common';
import { HealthController } from './infrastructure/health-check.controller';

@Module({
    controllers: [HealthController],
})
export class HealthCheckModule { }

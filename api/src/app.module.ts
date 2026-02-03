import { Module } from '@nestjs/common';
import { PrismaModule } from './shared/prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MulterModule } from '@nestjs/platform-express';
import { ErrorHandlerService } from './shared/error-handler/error-handler.service';
import { SharedModule } from './shared/shared.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { HealthCheckModule } from './modules/health-check/health-check.module';
@Module({
    imports: [
        PrismaModule,
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ScheduleModule.forRoot(),
        MulterModule.register({
            limits: { fileSize: 1000000 },
            dest: './uploads',
        }),
        SharedModule,
        HealthCheckModule,
        MailerModule.forRootAsync({
            useFactory: () => ({
                transport: {
                    host: process.env.SENDGRID_SMTP_HOST,
                    port: parseInt(process.env.SENDGRID_SMTP_PORT, 10),
                    secure: false,
                    auth: {
                        user: process.env.SENDGRID_SMTP_USER,
                        pass: process.env.SENDGRID_SMTP_PASS,
                    },
                },
                defaults: {
                    from: process.env.SENDGRID_SMTP_FROM,
                },
            }),
        }),
        HealthCheckModule,
    ],
    providers: [
        ErrorHandlerService,
    ],
})
export class AppModule { }

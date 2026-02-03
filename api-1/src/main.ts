import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const initSwagger = (app: INestApplication) => {
    const config = new DocumentBuilder().setTitle('Leitner system').build();

    const document = SwaggerModule.createDocument(app, config);

    SwaggerModule.setup('api', app, document);
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const port = process.env.PORT || 8080;
    app.enableCors({
        origin: '*',
        methods: 'GET,POST,PUT,PATCH,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    initSwagger(app);
    await app.listen(port);
    Logger.log(`Started on ${port}`);

}
bootstrap();

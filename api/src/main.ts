import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpErrorFilter } from './shared/error/infrastructure/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(app.get(HttpErrorFilter));
  app.enableCors({
    origin: '*',
    methods: '*',
    allowedHeaders: '*',
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS!.split(',').map((o) => o.trim()),
    credentials: true,
  });

  app.use(helmet());

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  const documentBuilder = new DocumentBuilder()
    .setTitle('HapHap API')
    .setDescription('Documentation for HapHap API')
    .setVersion('0.0')
    .addBearerAuth()
    .build();
  const documentFactory = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT!);
}

await bootstrap();

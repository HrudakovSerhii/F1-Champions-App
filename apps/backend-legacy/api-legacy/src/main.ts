/**
 * F1 Champions API
 * NestJS backend application for Formula 1 championship data
 */

import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

import { API_GLOBAL_PREFIX, CORS_ORIGIN } from './constants/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  // Enable CORS
  app.enableCors({
    origin: CORS_ORIGIN,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('F1 Champions API')
    .setDescription('API for Formula 1 season champions and race winners data')
    .setVersion('1.0.0')
    .addTag('API Info', 'General API information and metadata')
    .addTag('Champions', 'Operations related to Formula 1 season champions')
    .addTag('Race Winners', 'Operations related to Formula 1 race winners')
    .addTag('Health', 'Health check endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup(`${API_GLOBAL_PREFIX}/docs`, app, document, {
    customSiteTitle: 'F1 Champions API Documentation',
    customfavIcon: 'https://nestjs.com/img/logo_text.svg',
    customCss: '.swagger-ui .topbar { display: none }',
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 F1 Champions API is running on: http://localhost:${port}/${API_GLOBAL_PREFIX}`
  );
  Logger.log(
    `📚 API Documentation available at: http://localhost:${port}/${API_GLOBAL_PREFIX}/docs`
  );
  Logger.log(
    `🏥 Health check available at: http://localhost:${port}/${API_GLOBAL_PREFIX}/health`
  );
}

bootstrap().catch((error) => {
  Logger.error('Failed to start the application', error);

  process.exit(1);
});

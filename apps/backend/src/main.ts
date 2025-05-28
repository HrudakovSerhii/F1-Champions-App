/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';

import {
  API_GLOBAL_PREFIX,
  CORS_ORIGIN,
  DEFAULT_PORT,
} from './constants/constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix(API_GLOBAL_PREFIX);

  // Enable CORS
  app.enableCors({
    origin: CORS_ORIGIN,
    credential: true,
  });

  const port = process.env.PORT || DEFAULT_PORT;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${API_GLOBAL_PREFIX}`
  );
}

bootstrap();

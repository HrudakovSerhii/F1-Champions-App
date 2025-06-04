import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Shared modules
import { PrismaModule } from '../shared/database/prisma.module';
import { JolpicaF1Module } from '../shared/external-apis/jolpica-f1.module';

// Feature modules
import { SeasonsWinnersModule } from '../modules/seasons-winners/seasons-winners.module';
import { SeasonRaceWinnersModule } from '../modules/season-race-winners/season-race-winners.module';
import { HealthModule } from '../modules/health/health.module';

// API Info components
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Const
import { THROTTLER_LENGTH, THROTTLER_LIMIT } from '../constants/constants';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: THROTTLER_LENGTH, // 1 minute
        limit: THROTTLER_LIMIT, // 100 requests per minute
      },
    ]),

    // Shared modules
    PrismaModule,
    JolpicaF1Module,

    // Feature modules
    SeasonsWinnersModule,
    SeasonRaceWinnersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

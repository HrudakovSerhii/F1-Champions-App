import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// Shared modules
import { PrismaModule } from '../shared/database/prisma.module';
import { CacheModule } from '../shared/cache/cache.module';
import { JolpicaF1Module } from '../shared/external-apis/jolpica-f1.module';

// Feature modules
import { ChampionsModule } from '../modules/champions/champions.module';
import { RaceWinnersModule } from '../modules/race-winners/race-winners.module';
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
    CacheModule,
    JolpicaF1Module,

    // Feature modules
    ChampionsModule,
    RaceWinnersModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGard,
    },
  ],
})
export class AppModule {}

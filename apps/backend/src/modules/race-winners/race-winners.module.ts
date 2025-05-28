import { Module } from '@nestjs/common';
import { RaceWinnersController } from './race-winners.controller';
import { RaceWinnersService } from './race-winners.service';
import { JolpicaF1Module } from '../../shared/external-apis/jolpica-f1.module';
import { CacheModule } from '../../shared/cache/cache.module';

@Module({
  imports: [JolpicaF1Module, CacheModule],
  controllers: [RaceWinnersController],
  providers: [RaceWinnersService],
  exports: [RaceWinnersService],
})
export class RaceWinnersModule {}

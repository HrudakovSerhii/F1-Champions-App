import { Module } from '@nestjs/common';
import { SeasonRaceWinnersController } from './season-race-winners.controller';
import { SeasonRaceWinnersService } from './season-race-winners.service';
import { JolpicaF1Module } from '../../shared/external-apis/jolpica-f1.module';
import { DatabaseService } from '../../shared/database/database.service';
import { ExternalDataParserService } from '../../shared/transformers';
import {
  DataAggregationService,
  ApiAdapterService,
} from '../../shared/transformers';

@Module({
  imports: [JolpicaF1Module],
  controllers: [SeasonRaceWinnersController],
  providers: [
    SeasonRaceWinnersService,
    ExternalDataParserService,
    DatabaseService,
    DataAggregationService,
    ApiAdapterService,
  ],
  exports: [SeasonRaceWinnersService],
})
export class SeasonRaceWinnersModule {}

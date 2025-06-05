import { Module } from '@nestjs/common';
import { SeasonsWinnersController } from './seasons-winners.controller';
import { SeasonsWinnersService } from './seasons-winners.service';

import { JolpicaF1Module } from '../../shared/external-apis/jolpica-f1.module';
import { DatabaseService } from '../../shared/database/database.service';
import {
  DataAggregationService,
  ExternalDataParserService,
  ApiAdapterService,
} from '../../shared/transformers';

@Module({
  imports: [JolpicaF1Module],
  controllers: [SeasonsWinnersController],
  providers: [
    SeasonsWinnersService,
    ExternalDataParserService,
    DatabaseService,
    DataAggregationService,
    ApiAdapterServic,
  ],
  exports: [SeasonsWinnersService],
})
export class SeasonsWinnersModule {}

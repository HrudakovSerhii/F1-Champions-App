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
import { ApiValidationModule } from '../../common/services/api-validation.module';

@Module({
  imports: [JolpicaF1Module, ApiValidationModule],
  controllers: [SeasonsWinnersController],
  providers: [
    SeasonsWinnersService,
    ExternalDataParserService,
    DatabaseService,
    DataAggregationService,
    ApiAdapterService,
  ],
  exports: [SeasonsWinnersService],
})
export class SeasonsWinnersModule {}

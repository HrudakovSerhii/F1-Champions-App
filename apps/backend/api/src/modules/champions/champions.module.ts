import { Module } from '@nestjs/common';
import { ChampionsController } from './champions.controller';
import { ChampionsService } from './champions.service';
import { JolpicaF1Module } from '../../shared/external-apis/jolpica-f1.module';
import { CacheModule } from '../../shared/cache/cache.module';

@Module({
  imports: [JolpicaF1Module, CacheModule],
  controllers: [ChampionsController],
  providers: [ChampionsService],
  exports: [ChampionsService],
})
export class ChampionsModule {}

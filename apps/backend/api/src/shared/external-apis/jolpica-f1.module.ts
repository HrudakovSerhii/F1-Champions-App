import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { JolpicaF1Service } from './jolpica-f1.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [JolpicaF1Service],
  exports: [JolpicaF1Service],
})
export class JolpicaF1Module {}

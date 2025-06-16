import { Module } from '@nestjs/common';
import { ApiValidationService } from './api-validation.service';

@Module({
  providers: [ApiValidationService],
  exports: [ApiValidationService],
})
export class ApiValidationModule {}

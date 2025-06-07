import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import type { MinYearQueryParam, MaxYearQueryParam } from '@f1-app/api-types';

export class GetSeasonsWinnersDto {
  @ApiPropertyOptional({
    description: 'Minimum season year to filter from (inclusive)',
    pattern: '^[0-9]{4}$',
    example: '2020',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4}$/, { message: 'minYear must be a 4-digit year' })
  minYear?: MinYearQueryParam;

  @ApiPropertyOptional({
    description: 'Maximum season year to filter to (inclusive)',
    pattern: '^[0-9]{4}$',
    example: '2023',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4}$/, { message: 'maxYear must be a 4-digit year' })
  maxYear?: MaxYearQueryParam;
}

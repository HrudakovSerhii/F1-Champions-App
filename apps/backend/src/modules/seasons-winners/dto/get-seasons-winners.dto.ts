import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetSeasonsWinnersDto extends PaginationDto {
  @ApiPropertyOptional({
    description:
      'Specific season year to filter by (optional - if omitted, returns all champions)',
    pattern: '^[0-9]{4}$',
    example: '2023',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[0-9]{4}$/, { message: 'Season must be a 4-digit year' })
  season?: string;
}

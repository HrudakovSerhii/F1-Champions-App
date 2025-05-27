import { IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class GetRaceWinnersDto extends PaginationDto {
  @ApiProperty({
    description: 'The season year',
    pattern: '^[0-9]{4}$',
    example: '2023',
  })
  @IsString()
  @Matches(/^[0-9]{4}$/, { message: 'Season must be a 4-digit year' })
  season!: string;
}

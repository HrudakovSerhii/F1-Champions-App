import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeasonRaceWinnersService } from './season-race-winners.service';

import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Race Winners')
@Controller('f1/seasons')
export class SeasonRaceWinnersController {
  constructor(
    private readonly seasonRaceWinnersService: SeasonRaceWinnersService
  ) {}

  @Get(':season/race-winners')
  @ApiOperation({
    summary: 'Get race winners for a season',
    description:
      'Returns a list of race winners for all races in a specific Formula 1 season',
  })
  @ApiParam({
    name: 'season',
    description: 'The season year',
    example: '2023',
    schema: { type: 'string', pattern: '^[0-9]{4}$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 404,
    description: 'Season not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSeasonRaceWinners(
    @Param('season') season: string,
    @Query() query: PaginationDto
  ) {
    try {
      // Validate season format
      if (!/^[0-9]{4}$/.test(season)) {
        throw new HttpException(
          {
            error: {
              code: 'INVALID_SEASON',
              message: 'Season must be a 4-digit year',
            },
          },
          HttpStatus.BAD_REQUEST
        );
      }

      const { limit, offset } = query;
      const result = await this.seasonRaceWinnersService.getSeasonRaceWinners(
        season,
        limit,
        offset
      );

      if (!result) {
        throw new HttpException(
          {
            error: {
              code: 'RACE_WINNERS_NOT_FOUND',
              message: `Unable to fetch race winners data for season ${season}`,
            },
          },
          HttpStatus.NOT_FOUND
        );
      }

      return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          error: {
            code: 'INTERNAL_ERROR',
            message: `An unexpected error occurred while fetching race winners for season ${season}`,
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

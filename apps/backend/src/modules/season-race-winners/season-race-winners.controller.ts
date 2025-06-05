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
import { GetSeasonRaceWinnersDto } from './dto/get-season-race-winners.dto';

@ApiTags('Seasons')
@Controller('f1/season')
export class SeasonRaceWinnersController {
  constructor(
    private readonly seasonRaceWinnersService: SeasonRaceWinnersService
  ) {}

  @Get(':seasonYear/winners')
  @ApiOperation({
    summary: 'Get season winners',
    description: 'Retrieve all race winners for a specific F1 season',
  })
  @ApiParam({
    name: 'seasonYear',
    description: 'The F1 season year (e.g., 2023)',
    example: '2023',
    schema: { type: 'string', pattern: '^[0-9]{4}$' },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved race winners for the specified season',
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
    @Param('seasonYear') seasonYear: string,
    @Query() query: GetSeasonRaceWinnersDto
  ) {
    try {
      // Validate season format
      if (!/^[0-9]{4}$/.test(seasonYear)) {
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
        seasonYear,
        limit,
        offset
      );

      if (!result) {
        throw new HttpException(
          {
            error: {
              code: 'RACE_WINNERS_NOT_FOUND',
              message: `Unable to fetch race winners data for season ${seasonYear}`,
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
            message: `An unexpected error occurred while fetching race winners for season ${seasonYear}`,
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

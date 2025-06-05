import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeasonsWinnersService } from './seasons-winners.service';
import { GetSeasonsWinnersDto } from './dto/get-seasons-winners.dto';

import { DEFAULT_MAX_YEAR, DEFAULT_MIN_YEAR } from '../../constants/constants';

@ApiTags('SeasonsWinners')
@Controller('f1/winners')
export class SeasonsWinnersController {
  constructor(private readonly championsService: SeasonsWinnersService) {}

  @Get()
  @ApiOperation({
    summary: 'Get seasons champions',
    description: `Returns a list of Formula 1 season champions.
    Provides all championship winners from 1950 onwards in a single call.`,
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
    status: 500,
    description: 'Internal server error',
  })
  async getSeasonsWinners(@Query() query: GetSeasonsWinnersDto) {
    try {
      const { minYear, maxYear } = query;

      const _minYear = minYear
        ? parseInt(minYear.toString(), 10)
        : DEFAULT_MIN_YEAR;
      const _maxYear = maxYear
        ? parseInt(maxYear.toString(), 10)
        : DEFAULT_MAX_YEAR;

      const result = await this.championsService.getSeasonsWinners(
        _minYear,
        _maxYear
      );

      if (!result) {
        throw new HttpException(
          {
            error: {
              code: 'CHAMPIONS_NOT_FOUND',
              message: 'Unable to fetch champions data',
            },
          },
          HttpStatus.INTERNAL_SERVER_ERROR
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
            message: 'An unexpected error occurred while fetching champions',
            details: error instanceof Error ? error.message : 'Unknown error',
          },
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

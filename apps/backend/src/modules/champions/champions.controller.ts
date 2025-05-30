import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ChampionsService } from './champions.service';
import { GetChampionsDto } from './dto/get-champions.dto';

import { DEFAULT_LIMIT, DEFAULT_OFFSET } from '../../constants/constants';

@ApiTags('Champions')
@Controller('f1/champions')
export class ChampionsController {
  constructor(private readonly championsService: ChampionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all season champions',
    description: `Returns a list of Formula 1 season champions (drivers who won the championship each year).
    Provides all championship winners from 1950 onwards in a single call.
    Based on Ergast API endpoint: /driverStandings/1`,
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
  async getChampions(@Query() query: GetChampionsDto) {
    try {
      const { limit, offset, season } = query;

      const takeLimit = limit ? parseInt(limit.toString(), 10) : DEFAULT_LIMIT;
      const skipOffset = offset
        ? parseInt(offset.toString(), 10)
        : DEFAULT_OFFSET;

      const result = await this.championsService.getChampions(
        takeLimit,
        skipOffset,
        season
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

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
import { ApiValidationService } from '../../common/services/api-validation.service';

@ApiTags('SeasonsWinners')
@Controller('f1/winners')
export class SeasonsWinnersController {
  constructor(
    private readonly championsService: SeasonsWinnersService,
    private readonly apiValidationService: ApiValidationService
  ) {}

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

      // Validate year range using validation service
      const validation = this.apiValidationService.validateYearRange(
        minYear?.toString(),
        maxYear?.toString()
      );

      if (!validation.isValid) {
        throw new HttpException(
          { error: validation.error },
          validation.error!.status
        );
      }

      const result = await this.championsService.getSeasonsWinners(
        validation.minYear!,
        validation.maxYear!
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

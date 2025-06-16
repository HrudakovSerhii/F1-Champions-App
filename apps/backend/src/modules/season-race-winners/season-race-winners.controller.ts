import {
  Controller,
  Get,
  Param,
  Query,
  HttpException,
  HttpStatus,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SeasonRaceWinnersService } from './season-race-winners.service';
import { GetSeasonRaceWinnersDto } from './dto/get-season-race-winners.dto';
import { ApiValidationService } from '../../common/services/api-validation.service';

@ApiTags('Seasons')
@Controller('f1/season')
export class SeasonRaceWinnersController {
  constructor(
    private readonly seasonRaceWinnersService: SeasonRaceWinnersService,
    private readonly apiValidationService: ApiValidationService
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
    schema: {
      type: 'string',
      pattern: '^[0-9]{4}$, // Only allow exactly 4 digits',
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved race winners for the specified season',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid season format',
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
    @Param(
      'seasonYear',
      new ValidationPipe({
        transform: true,
        transformOptions: { enableImplicitConversion: true },
        errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        validateCustomDecorators: true,
        exceptionFactory: (errors) => {
          return new HttpException(
            {
              error: {
                code: 'SEASON_FORMAT_TYPE_ERROR',
                message: 'Season must be a number',
              },
            },
            HttpStatus.BAD_REQUEST
          );
        },
      })
    )
    seasonYear: string,
    @Query() query: GetSeasonRaceWinnersDto
  ) {
    try {
      // Validate season using validation service
      const validation =
        this.apiValidationService.validateSeasonYear(seasonYear);
      if (!validation.isValid) {
        throw new HttpException(
          { error: validation.error },
          validation.error!.status
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

import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { PrismaService } from '../../shared/database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaService: PrismaService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description:
      'Returns the health status of the application and its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
  })
  @ApiResponse({
    status: 503,
    description: 'Service unavailable',
  })
  @HealthCheck()
  check() {
    return this.health.check([() => this.checkDatabase()]);
  }

  private async checkDatabase(): Promise<HealthIndicatorResult> {
    const key = 'database';
    try {
      // Use a simple findFirst operation to test MongoDB connectivity
      // This is compatible with MongoDB and doesn't require $queryRaw
      await this.prismaService.driver.findFirst();

      return {
        [key]: {
          status: 'up',
          message: 'Database connection is healthy',
        },
      };
    } catch (error) {
      return {
        [key]: {
          status: 'down',
          message: `Database connection failed: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
        },
      };
    }
  }
}

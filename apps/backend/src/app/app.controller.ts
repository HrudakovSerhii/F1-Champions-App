import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';
import type { ApiInfo } from './app.service';

@ApiTags('API Info')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get API Information',
    description:
      'Returns comprehensive information about the F1 Champions API including available endpoints, features, and configuration details.',
  })
  @ApiResponse({
    status: 200,
    description: 'API information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'F1 Champions API' },
        version: { type: 'string', example: '1.0.0' },
        description: {
          type: 'string',
          example: 'API for Formula 1 season champions and race winners data',
        },
        documentation: {
          type: 'string',
          example: 'http://localhost:4000/api/v1/docs',
        },
        health: {
          type: 'string',
          example: 'http://localhost:4000/api/v1/health',
        },
        endpoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              method: { type: 'string' },
              description: { type: 'string' },
              tag: { type: 'string' },
            },
          },
        },
        features: {
          type: 'array',
          items: { type: 'string' },
        },
        rateLimit: {
          type: 'object',
          properties: {
            requests: { type: 'number' },
            window: { type: 'string' },
          },
        },
      },
    },
  })
  getApiInfo(): ApiInfo {
    return this.appService.getApiInfo();
  }

  @Get('health')
  @ApiOperation({
    summary: 'Health Check',
    description: 'Returns the health status of the API server.',
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-01T00:00:00.000Z' },
        uptime: { type: 'number', example: 123.456 },
        environment: { type: 'string', example: 'development' },
        database: { type: 'string', example: 'connected' },
      },
    },
  })
  getHealth() {
    return this.appService.getHealth();
  }
}

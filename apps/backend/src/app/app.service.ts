import { Injectable } from '@nestjs/common';

import { BASE_URL } from '../constants/constants';

export interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  tag: string;
}

export interface ApiInfo {
  name: string;
  version: string;
  description: string;
  documentation: string;
  health: string;
  endpoints: ApiEndpoint[];
  features: string[];
  rateLimit: {
    requests: number;
    window: string;
  };
}

export interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  database: string;
}

@Injectable()
export class AppService {
  getApiInfo(): ApiInfo {
    return {
      name: 'F1 Champions API',
      version: '1.0.0',
      description: 'API for Formula 1 season champions and race winners data',
      documentation: `${BASE_URL}/docs`,
      health: `${BASE_URL}/health`,
      endpoints: [
        {
          path: '/champions',
          method: 'GET',
          description: 'Get Formula 1 season champions',
          tag: 'Champions',
        },
        {
          path: '/champions/{year}',
          method: 'GET',
          description: 'Get champion for specific year',
          tag: 'Champions',
        },
        {
          path: '/race-winners',
          method: 'GET',
          description: 'Get Formula 1 race winners',
          tag: 'Race Winners',
        },
        {
          path: '/race-winners/{year}',
          method: 'GET',
          description: 'Get race winners for specific year',
          tag: 'Race Winners',
        },
        {
          path: '/health',
          method: 'GET',
          description: 'Health check endpoint',
          tag: 'Health',
        },
      ],
      features: [
        'Formula 1 Champions Data',
        'Race Winners Information',
        'Health Monitoring',
        'Rate Limiting',
        'CORS Support',
        'Input Validation',
        'Swagger Documentation',
      ],
      rateLimit: {
        requests: 30,
        window: '1 minute',
      },
    };
  }

  getHealth(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: 'connected', // TODO: Add actual database health check
    };
  }
}

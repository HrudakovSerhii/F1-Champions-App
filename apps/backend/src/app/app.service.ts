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

// TODO: check if endpoints.path param can be taken from generated types

@Injectable()
export class AppService {
  getApiInfo(): ApiInfo {
    return {
      name: 'F1 Champions API',
      version: '1.0.0',
      description:
        'API for retrieving Formula 1 championship data including season winners and season race results',
      documentation: `${BASE_URL}/docs`,
      health: `${BASE_URL}/api/v1/health`,
      endpoints: [
        {
          path: '/api/v1/f1/winners',
          method: 'GET',
          description:
            'Get seasons with winners - retrieve all F1 seasons with their respective championship winners',
          tag: 'Seasons',
        },
        {
          path: '/api/v1/f1/season/{seasonYear}/winners',
          method: 'GET',
          description:
            'Get season race winners - retrieve all race winners for a specific F1 season',
          tag: 'Seasons',
        },
        {
          path: '/api/v1/health',
          method: 'GET',
          description: 'Check the health status of the backend API server',
          tag: 'Health',
        },
      ],
      features: [
        'Formula 1 Season Champions Data',
        'Season Race Winners Information',
        'Health Status Monitoring',
        'Rate Limiting & Security',
        'CORS Support',
        'Request Validation',
        'OpenAPI Documentation',
        'Dependency Status Tracking',
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

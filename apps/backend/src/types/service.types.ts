/**
 * Service Types
 *
 * Types for service layer operations and business logic.
 * These types support the actual service patterns used in the backend.
 */

// Service operation results
export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: {
    timestamp: string;
    duration?: number;
    cached?: boolean;
  };
}

export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
}

// Cache management types (for existing cache module)
export interface CacheOptions {
  key: string;
  ttl?: number; // Time to live in seconds
  tags?: string[];
}

export interface CacheResult<T> {
  data: T;
  hit: boolean;
  key: string;
  expiresAt?: Date;
}

// External API service types (for Jolpica F1 service)
export interface ExternalApiConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  rateLimitPerSecond?: number;
  headers?: Record<string, string>;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  params?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiRequestResult<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  duration: number;
}

// Health check types (for health module)
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  uptime: number;
  timestamp: Date;
}

export interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message?: string;
  responseTime?: number;
}

// Performance metrics
export interface PerformanceMetrics {
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate?: number;
  timestamp: Date;
}

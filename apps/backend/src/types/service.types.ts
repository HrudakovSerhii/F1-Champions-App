/**
 * API service Types
 *
 * Types for API responses and internal API operations.
 */

// Common API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    version: string;
    requestId?: string;
  };
}

// Error response types
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: any;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationErrorResponse {
  message: string;
  errors: ValidationError[];
}

// Request types for filtering and searching
export interface ApiQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  season?: string;
  year?: string;
  nationality?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  database: {
    status: 'connected' | 'disconnected';
    replicaSet?: string;
  };
  version: string;
}

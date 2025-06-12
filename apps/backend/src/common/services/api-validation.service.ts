import { Injectable, HttpStatus } from '@nestjs/common';
import { DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR } from '../../constants/constants';

export interface ValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

export interface YearRangeValidationResult {
  isValid: boolean;
  minYear?: number;
  maxYear?: number;
  error?: {
    code: string;
    message: string;
    status: number;
  };
}

@Injectable()
export class ApiValidationService {
  /**
   * Validates a single season year parameter
   * Used for endpoints like /f1/season/:seasonYear/winners
   */
  validateSeasonYear(seasonYear: string): ValidationResult {
    // Empty string validation
    if (!seasonYear || seasonYear.trim() === '') {
      return {
        isValid: false,
        error: {
          code: 'SEASON_REQUIRED',
          message: 'Season is required and cannot be empty',
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Type validation (must be numeric)
    if (!/^\d+$/.test(seasonYear.trim())) {
      return {
        isValid: false,
        error: {
          code: 'SEASON_FORMAT_TYPE_ERROR',
          message: 'Season must be a number',
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Length validation (must be exactly 4 digits)
    if (seasonYear.trim().length !== 4) {
      return {
        isValid: false,
        error: {
          code: 'SEASON_FORMAT_ERROR',
          message: 'Season must be exactly 4 digits',
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Range validation
    const year = parseInt(seasonYear.trim(), 10);
    if (year < DEFAULT_MIN_YEAR || year > DEFAULT_MAX_YEAR) {
      return {
        isValid: false,
        error: {
          code: 'SEASON_RANGE_ERROR',
          message: `Season must be between ${DEFAULT_MIN_YEAR} and ${DEFAULT_MAX_YEAR}`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    return { isValid: true };
  }

  /**
   * Validates year range parameters (minYear, maxYear)
   * Used for endpoints like /f1/winners?minYear=2020&maxYear=2023
   */
  validateYearRange(
    minYear?: string,
    maxYear?: string
  ): YearRangeValidationResult {
    let validatedMinYear = DEFAULT_MIN_YEAR;
    let validatedMaxYear = DEFAULT_MAX_YEAR;

    // Validate minYear if provided
    if (minYear !== undefined && minYear !== null) {
      const minYearValidation = this.validateSingleYear(minYear, 'minYear');
      if (!minYearValidation.isValid) {
        return {
          isValid: false,
          error: minYearValidation.error,
        };
      }
      validatedMinYear = parseInt(minYear.trim(), 10);
    }

    // Validate maxYear if provided
    if (maxYear !== undefined && maxYear !== null) {
      const maxYearValidation = this.validateSingleYear(maxYear, 'maxYear');
      if (!maxYearValidation.isValid) {
        return {
          isValid: false,
          error: maxYearValidation.error,
        };
      }
      validatedMaxYear = parseInt(maxYear.trim(), 10);
    }

    // Logical validation: minYear should not be greater than maxYear
    if (validatedMinYear > validatedMaxYear) {
      return {
        isValid: false,
        error: {
          code: 'YEAR_RANGE_LOGIC_ERROR',
          message: `minYear (${validatedMinYear}) cannot be greater than maxYear (${validatedMaxYear})`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    return {
      isValid: true,
      minYear: validatedMinYear,
      maxYear: validatedMaxYear,
    };
  }

  /**
   * Helper method to validate a single year parameter
   * Used internally by validateYearRange
   */
  private validateSingleYear(
    year: string,
    paramName: string
  ): ValidationResult {
    // Empty string validation
    if (!year || year.trim() === '') {
      return {
        isValid: false,
        error: {
          code: `${paramName.toUpperCase()}_REQUIRED`,
          message: `${paramName} is required and cannot be empty`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Type validation (must be numeric)
    if (!/^\d+$/.test(year.trim())) {
      return {
        isValid: false,
        error: {
          code: `${paramName.toUpperCase()}_FORMAT_TYPE_ERROR`,
          message: `${paramName} must be a number`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Length validation (must be exactly 4 digits)
    if (year.trim().length !== 4) {
      return {
        isValid: false,
        error: {
          code: `${paramName.toUpperCase()}_FORMAT_ERROR`,
          message: `${paramName} must be exactly 4 digits`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    // Range validation
    const yearNum = parseInt(year.trim(), 10);
    if (yearNum < DEFAULT_MIN_YEAR || yearNum > DEFAULT_MAX_YEAR) {
      return {
        isValid: false,
        error: {
          code: `${paramName.toUpperCase()}_RANGE_ERROR`,
          message: `${paramName} must be between ${DEFAULT_MIN_YEAR} and ${DEFAULT_MAX_YEAR}`,
          status: HttpStatus.BAD_REQUEST,
        },
      };
    }

    return { isValid: true };
  }
}

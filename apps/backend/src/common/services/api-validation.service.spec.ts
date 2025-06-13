import { Test } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { ApiValidationService } from './api-validation.service';
import { DEFAULT_MIN_YEAR, DEFAULT_MAX_YEAR } from '../../constants/constants';

describe('ApiValidationService', () => {
  let service: ApiValidationService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ApiValidationService],
    }).compile();

    service = module.get<ApiValidationService>(ApiValidationService);
  });

  describe('validateSeasonYear', () => {
    describe('success cases', () => {
      it('should validate a correct 4-digit year within range', () => {
        const result = service.validateSeasonYear('2023');
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should validate minimum year', () => {
        const result = service.validateSeasonYear(DEFAULT_MIN_YEAR.toString());
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it('should validate maximum year', () => {
        const result = service.validateSeasonYear(DEFAULT_MAX_YEAR.toString());
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe('empty string validation', () => {
      it('should return SEASON_REQUIRED for empty string', () => {
        const result = service.validateSeasonYear('');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_REQUIRED');
        expect(result.error?.message).toBe(
          'Season is required and cannot be empty'
        );
        expect(result.error?.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it('should return SEASON_REQUIRED for whitespace-only string', () => {
        const result = service.validateSeasonYear('   ');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_REQUIRED');
      });
    });

    describe('format type validation', () => {
      it('should return SEASON_FORMAT_TYPE_ERROR for alphabetic characters', () => {
        const result = service.validateSeasonYear('abcd');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_TYPE_ERROR');
        expect(result.error?.message).toBe('Season must be a number');
        expect(result.error?.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it('should return SEASON_FORMAT_TYPE_ERROR for special characters', () => {
        const result = service.validateSeasonYear('!@#$');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_TYPE_ERROR');
      });

      it('should return SEASON_FORMAT_TYPE_ERROR for mixed alphanumeric', () => {
        const result = service.validateSeasonYear('20ab');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_TYPE_ERROR');
      });
    });

    describe('format length validation', () => {
      it('should return SEASON_FORMAT_ERROR for 2 digits', () => {
        const result = service.validateSeasonYear('20');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_ERROR');
        expect(result.error?.message).toBe('Season must be exactly 4 digits');
        expect(result.error?.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it('should return SEASON_FORMAT_ERROR for 5 digits', () => {
        const result = service.validateSeasonYear('20234');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_ERROR');
      });

      it('should return SEASON_FORMAT_ERROR for 3 digits', () => {
        const result = service.validateSeasonYear('123');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_FORMAT_ERROR');
      });
    });

    describe('range validation', () => {
      it('should return SEASON_RANGE_ERROR for year below minimum', () => {
        const belowMin = (DEFAULT_MIN_YEAR - 1).toString();
        const result = service.validateSeasonYear(belowMin);
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_RANGE_ERROR');
        expect(result.error?.message).toBe(
          `Season must be between ${DEFAULT_MIN_YEAR} and ${DEFAULT_MAX_YEAR}`
        );
        expect(result.error?.status).toBe(HttpStatus.BAD_REQUEST);
      });

      it('should return SEASON_RANGE_ERROR for year above maximum', () => {
        const aboveMax = (DEFAULT_MAX_YEAR + 1).toString();
        const result = service.validateSeasonYear(aboveMax);
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('SEASON_RANGE_ERROR');
      });
    });
  });

  describe('validateYearRange', () => {
    describe('success cases', () => {
      it('should validate with no parameters (use defaults)', () => {
        const result = service.validateYearRange();
        expect(result.isValid).toBe(true);
        expect(result.minYear).toBe(DEFAULT_MIN_YEAR);
        expect(result.maxYear).toBe(DEFAULT_MAX_YEAR);
      });

      it('should validate with only minYear', () => {
        const result = service.validateYearRange('2022');
        expect(result.isValid).toBe(true);
        expect(result.minYear).toBe(2022);
        expect(result.maxYear).toBe(DEFAULT_MAX_YEAR);
      });

      it('should validate with only maxYear', () => {
        const result = service.validateYearRange(undefined, '2023');
        expect(result.isValid).toBe(true);
        expect(result.minYear).toBe(DEFAULT_MIN_YEAR);
        expect(result.maxYear).toBe(2023);
      });

      it('should validate with both minYear and maxYear', () => {
        const result = service.validateYearRange('2022', '2023');
        expect(result.isValid).toBe(true);
        expect(result.minYear).toBe(2022);
        expect(result.maxYear).toBe(2023);
      });
    });

    describe('minYear validation errors', () => {
      it('should return MINYEAR_FORMAT_TYPE_ERROR for invalid minYear', () => {
        const result = service.validateYearRange('abcd', '2023');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('MINYEAR_FORMAT_TYPE_ERROR');
        expect(result.error?.message).toBe('minYear must be a number');
      });

      it('should return MINYEAR_RANGE_ERROR for minYear out of range', () => {
        const belowMin = (DEFAULT_MIN_YEAR - 1).toString();
        const result = service.validateYearRange(belowMin, '2023');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('MINYEAR_RANGE_ERROR');
      });
    });

    describe('maxYear validation errors', () => {
      it('should return MAXYEAR_FORMAT_TYPE_ERROR for invalid maxYear', () => {
        const result = service.validateYearRange('2022', 'abcd');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('MAXYEAR_FORMAT_TYPE_ERROR');
        expect(result.error?.message).toBe('maxYear must be a number');
      });

      it('should return MAXYEAR_RANGE_ERROR for maxYear out of range', () => {
        const aboveMax = (DEFAULT_MAX_YEAR + 1).toString();
        const result = service.validateYearRange('2022', aboveMax);
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('MAXYEAR_RANGE_ERROR');
      });
    });

    describe('logic validation', () => {
      it('should return YEAR_RANGE_LOGIC_ERROR when minYear > maxYear', () => {
        const result = service.validateYearRange('2023', '2022');
        expect(result.isValid).toBe(false);
        expect(result.error?.code).toBe('YEAR_RANGE_LOGIC_ERROR');
        expect(result.error?.message).toBe(
          'minYear (2023) cannot be greater than maxYear (2022)'
        );
        expect(result.error?.status).toBe(HttpStatus.BAD_REQUEST);
      });
    });
  });
});

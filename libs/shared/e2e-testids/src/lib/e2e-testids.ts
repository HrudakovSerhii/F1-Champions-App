/**
 * Test IDs Library - Screen-Based Organization
 *
 * This library provides a centralized, screen-based approach to test ID management.
 * Each screen has its own section with logically grouped test IDs.
 *
 * Usage:
 * - Frontend: <button data-testid={TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS}>
 * - E2E Tests: page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS}"]`)
 *
 * Naming Convention:
 * - SCREEN_NAME.COMPONENT_NAME.ACTION_OR_ELEMENT
 * - Use SCREAMING_SNAKE_CASE for consistency
 * - Be descriptive but concise
 */

export const TEST_IDS = {
  /**
   * HOME SCREEN - Main landing page
   * URL: /
   */
  HOME_SCREEN: {
    // Page Layout
    PAGE_HEADER: 'home-page-header',
    PAGE_TITLE: 'home-page-title',
    LOADING_SPINNER: 'home-loading-spinner',
    ERROR_MESSAGE: 'home-error-message',

    // Navigation
    NAVIGATION_MENU: 'home-navigation-menu',
    NAV_HOME_LINK: 'home-nav-home-link',
    NAV_CHAMPIONS_LINK: 'home-nav-champions-link',
    NAV_SEASONS_LINK: 'home-nav-seasons-link',

    // Champions Section
    CHAMPIONS_SECTION: 'home-champions-section',
    CHAMPIONS_TITLE: 'home-champions-title',
    CHAMPIONS_LIST: 'home-champions-list',
    CHAMPIONS_LOADING: 'home-champions-loading',
    CHAMPIONS_ERROR: 'home-champions-error',

    // Champion Card Component
    CHAMPION_CARD: {
      CONTAINER: 'champion-card-container',
      DRIVER_NAME: 'champion-card-driver-name',
      SEASON_YEAR: 'champion-card-season',
      CONSTRUCTOR: 'champion-card-constructor',
      POINTS: 'champion-card-points',
      WINS: 'champion-card-wins',
      VIEW_DETAILS: 'champion-card-view-details',
      DRIVER_IMAGE: 'champion-card-driver-image',
    },

    // Filters & Search
    SEARCH_INPUT: 'home-search-input',
    SEARCH_BUTTON: 'home-search-button',
    SEARCH_CLEAR: 'home-search-clear',
    SEASON_FILTER: 'home-season-filter',
    CONSTRUCTOR_FILTER: 'home-constructor-filter',
    SORT_DROPDOWN: 'home-sort-dropdown',

    // Pagination
    PAGINATION: {
      CONTAINER: 'home-pagination-container',
      PREVIOUS_BUTTON: 'home-pagination-previous',
      NEXT_BUTTON: 'home-pagination-next',
      PAGE_NUMBER: 'home-pagination-page',
      PAGE_INFO: 'home-pagination-info',
    },
  },

  /**
   * CHAMPION DETAILS SCREEN - Individual champion page
   * URL: /champion/:id
   */
  CHAMPION_DETAILS_SCREEN: {
    // Page Layout
    PAGE_HEADER: 'champion-details-header',
    BACK_BUTTON: 'champion-details-back',
    BREADCRUMB: 'champion-details-breadcrumb',

    // Champion Info
    DRIVER_PROFILE: {
      CONTAINER: 'champion-driver-profile',
      NAME: 'champion-driver-name',
      NATIONALITY: 'champion-driver-nationality',
      DATE_OF_BIRTH: 'champion-driver-dob',
      IMAGE: 'champion-driver-image',
      BIO: 'champion-driver-bio',
    },

    // Season Stats
    SEASON_STATS: {
      CONTAINER: 'champion-season-stats',
      YEAR: 'champion-season-year',
      POINTS: 'champion-season-points',
      WINS: 'champion-season-wins',
      PODIUMS: 'champion-season-podiums',
      CONSTRUCTOR: 'champion-season-constructor',
    },

    // Race Results
    RACE_RESULTS: {
      TABLE: 'champion-race-results-table',
      HEADER: 'champion-race-results-header',
      ROW: 'champion-race-results-row',
      RACE_NAME: 'champion-race-name',
      POSITION: 'champion-race-position',
      POINTS: 'champion-race-points',
    },
  },

  /**
   * SEASONS SCREEN - All seasons overview
   * URL: /seasons
   */
  SEASONS_SCREEN: {
    // Page Layout
    PAGE_HEADER: 'seasons-page-header',
    PAGE_TITLE: 'seasons-page-title',

    // Seasons List
    SEASONS_LIST: 'seasons-list',
    SEASON_CARD: {
      CONTAINER: 'season-card-container',
      YEAR: 'season-card-year',
      CHAMPION: 'season-card-champion',
      CONSTRUCTOR_CHAMPION: 'season-card-constructor',
      RACES_COUNT: 'season-card-races-count',
      VIEW_DETAILS: 'season-card-view-details',
    },

    // Filters
    YEAR_FILTER: 'seasons-year-filter',
    ERA_FILTER: 'seasons-era-filter',
  },

  /**
   * SEASON DETAILS SCREEN - Individual season details
   * URL: /season/:year
   */
  SEASON_DETAILS_SCREEN: {
    // Page Layout
    PAGE_HEADER: 'season-details-header',
    SEASON_YEAR: 'season-details-year',
    BACK_BUTTON: 'season-details-back',

    // Championship Results
    CHAMPIONSHIP_RESULTS: {
      DRIVER_STANDINGS: 'season-driver-standings',
      CONSTRUCTOR_STANDINGS: 'season-constructor-standings',
      STANDINGS_TABLE: 'season-standings-table',
    },

    // Race Calendar
    RACE_CALENDAR: {
      CONTAINER: 'season-race-calendar',
      RACE_ITEM: 'season-race-item',
      RACE_NAME: 'season-race-name',
      RACE_DATE: 'season-race-date',
      RACE_WINNER: 'season-race-winner',
    },
  },

  /**
   * COMMON COMPONENTS - Reusable across screens
   */
  COMMON: {
    // Loading States
    LOADING_SPINNER: 'loading-spinner',
    LOADING_SKELETON: 'loading-skeleton',

    // Error States
    ERROR_BOUNDARY: 'error-boundary',
    ERROR_MESSAGE: 'error-message',
    ERROR_RETRY_BUTTON: 'error-retry-button',

    // Navigation
    HEADER: 'app-header',
    LOGO: 'app-logo',
    MAIN_NAV: 'main-navigation',
    FOOTER: 'app-footer',

    // Modal/Dialog
    MODAL: {
      OVERLAY: 'modal-overlay',
      CONTAINER: 'modal-container',
      HEADER: 'modal-header',
      BODY: 'modal-body',
      FOOTER: 'modal-footer',
      CLOSE_BUTTON: 'modal-close',
    },

    // Form Elements
    FORM: {
      INPUT: 'form-input',
      BUTTON: 'form-button',
      SELECT: 'form-select',
      CHECKBOX: 'form-checkbox',
      RADIO: 'form-radio',
      TEXTAREA: 'form-textarea',
    },

    // Data Tables
    TABLE: {
      CONTAINER: 'data-table',
      HEADER: 'data-table-header',
      BODY: 'data-table-body',
      ROW: 'data-table-row',
      CELL: 'data-table-cell',
      SORT_BUTTON: 'data-table-sort',
    },
  },
} as const;

/**
 * Helper Functions for Test ID Management
 */

/**
 * Generate a dynamic test ID with parameters
 * @param baseId - Base test ID from TEST_IDS
 * @param params - Parameters to append
 * @example getDynamicTestId(TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONTAINER, { index: 0 })
 */
export function getDynamicTestId(
  baseId: string,
  params: Record<string, string | number>
): string {
  const paramString = Object.entries(params)
    .map(([key, value]) => `${key}-${value}`)
    .join('-');
  return `${baseId}-${paramString}`;
}

/**
 * Generate a test ID for list items
 * @param baseId - Base test ID
 * @param index - Item index
 */
export function getListItemTestId(baseId: string, index: number): string {
  return `${baseId}-item-${index}`;
}

/**
 * Generate a test ID for form fields
 * @param screen - Screen name
 * @param fieldName - Field name
 */
export function getFormFieldTestId(screen: string, fieldName: string): string {
  return `${screen}-form-${fieldName}`;
}

/**
 * Type definitions for better TypeScript support
 */
export type TestIds = typeof TEST_IDS;
export type HomeScreenTestIds = typeof TEST_IDS.HOME_SCREEN;
export type ChampionDetailsTestIds = typeof TEST_IDS.CHAMPION_DETAILS_SCREEN;
export type SeasonsScreenTestIds = typeof TEST_IDS.SEASONS_SCREEN;
export type SeasonDetailsTestIds = typeof TEST_IDS.SEASON_DETAILS_SCREEN;
export type CommonTestIds = typeof TEST_IDS.COMMON;

/**
 * Test ID validation helpers for development
 */
export function validateTestId(testId: string): boolean {
  const pattern = /^[a-z0-9-]+$/;
  return pattern.test(testId);
}

export function getTestIdFromElement(element: string): string | null {
  const match = element.match(/data-testid="([^"]+)"/);
  return match ? match[1] : null;
}

// Export all test IDs as a flat object for easy searching
export const ALL_TEST_IDS = Object.freeze({
  ...flatten(TEST_IDS.HOME_SCREEN, 'HOME_SCREEN'),
  ...flatten(TEST_IDS.CHAMPION_DETAILS_SCREEN, 'CHAMPION_DETAILS_SCREEN'),
  ...flatten(TEST_IDS.SEASONS_SCREEN, 'SEASONS_SCREEN'),
  ...flatten(TEST_IDS.SEASON_DETAILS_SCREEN, 'SEASON_DETAILS_SCREEN'),
  ...flatten(TEST_IDS.COMMON, 'COMMON'),
});

function flatten(
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null) {
      Object.assign(result, flatten(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value as string;
    }
  }

  return result;
}

# F1 Champions App - E2E Test Suite Documentation

## 🏎️ Overview

This document describes the comprehensive End-to-End (E2E) test suite for the F1 Champions App. The test suite is built using Playwright and covers both UI and API testing scenarios to ensure the application works correctly from end to end.

## 🏗️ Infrastructure Setup

Complete Playwright configuration with multi-browser support, Nx integration, environment management, and TypeScript ES2022 setup.

```
apps/e2e/
├── src/
│   ├── tests/
│   │   ├── ui/                 # User Interface tests
│   │   │   └── home-page.spec.ts
│   │   ├── api/                # API endpoint tests
│   │   │   ├── api-info.spec.ts
│   │   │   ├── champions.spec.ts
│   │   │   └── race-winners.spec.ts
│   │   └── setup/              # Authentication and setup tests
│   │       └── auth.setup.ts
│   ├── pages/                  # Page Object Models
│   │   ├── base-page.ts
│   │   └── home-page.ts
│   └── utils/                  # Test utilities
│       ├── global-setup.ts
│       ├── global-teardown.ts
│       └── test-environment.ts
├── playwright.config.ts        # Playwright configuration
├── package.json               # E2E dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── project.json              # Nx project configuration
```

## 🧪 Test Implementation

4 test spec files with 50+ API scenarios and 10+ UI scenarios using Page Object Model architecture with full data validation.

## 🎯 Test Coverage

Comprehensive API testing (health, champions, race winners) and UI testing (cross-browser, mobile, responsive) with performance assertions.

## 🛠️ Developer Experience

10+ npm scripts for different testing scenarios (e2e:ui, e2e:chrome/firefox/safari, e2e:api, e2e:mobile, e2e:debug) with Nx target integration.

## 🌍 Environment Configuration

Configurable service URLs via FE_BASE_URL, BE_BASE_URL, and API_BASE_URL_PATH environment variables for flexible deployment.

## 📊 Reporting & CI/CD

Multiple report formats (HTML, JSON, JUnit), visual evidence capture, trace collection, and CI/CD ready configuration.

## 📖 Documentation

Complete documentation suite including README.md for quick start, comprehensive TEST_DOCUMENTATION.md (300+ lines), and SETUP_SUMMARY.md.

## 📈 Statistics

18 files created, 4 test spec files, 5 browser configurations, 10+ NPM scripts - production-ready E2E testing foundation.

See apps/e2e/TEST_DOCUMENTATION.md for detailed setup, configuration, and maintenance instructions.

Resolves: Setup E2E testing infrastructure

## 🧪 Test Categories

### 1. UI Tests (`apps/e2e/src/tests/ui/`)

#### Home Page Tests (`home-page.spec.ts`)

Tests the main application interface and user interactions:

- **Page Loading**: Verifies the home page loads successfully
- **Header Display**: Checks page header visibility and content
- **Navigation**: Validates navigation menu functionality
- **Champions Section**: Ensures champions data displays correctly
- **Data Loading**: Validates champions list populates with valid data
- **Search Functionality**: Tests search feature (if available)
- **Filtering**: Tests season filtering capabilities (if available)
- **Mobile Responsiveness**: Verifies mobile viewport compatibility
- **Page Refresh**: Tests application behavior after page refresh
- **Screenshot Capture**: Demonstrates failure screenshot functionality

### 2. API Tests (`apps/e2e/src/tests/api/`)

#### API Information Tests (`api-info.spec.ts`)

Tests core API information and health endpoints:

**GET `/` - API Information**

- ✅ Returns correct API information structure
- ✅ Validates API name, version, and description
- ✅ Checks endpoints array structure
- ✅ Validates features list (Rate Limiting, CORS, etc.)
- ✅ Verifies rate limit configuration (30 requests/minute)
- ✅ Tests content-type headers

**GET `/health` - Health Check**

- ✅ Returns healthy status with all required fields
- ✅ Validates response time (< 1 second)
- ✅ Checks database connection status
- ✅ Verifies timestamp format and validity
- ✅ Tests uptime reporting

**Rate Limiting & Error Handling**

- ✅ Validates rate limit headers (if present)
- ✅ Tests 404 handling for non-existent endpoints
- ✅ Verifies error responses for invalid HTTP methods

#### Champions API Tests (`champions.spec.ts`)

Tests the F1 champions endpoint based on API specifications:

**GET `/f1/champions` - All Champions**

- ✅ Returns champions with default parameters (limit=30, offset=0)
- ✅ Validates MRData structure and F1 series identifier
- ✅ Tests pagination with custom limit and offset
- ✅ Validates limit boundaries (1-100)
- ✅ Rejects invalid limits (>100, <1, non-numeric)
- ✅ Tests season-specific filtering
- ✅ Validates champion data structure:
  - Driver information (name, nationality, DOB, etc.)
  - Constructor details (team, nationality, etc.)
  - Championship statistics (position, points, wins)
- ✅ Handles invalid season formats (non-numeric, too short/long)
- ✅ Gracefully handles non-existent seasons (pre-1950, future)
- ✅ Validates total count accuracy
- ✅ Tests response time (< 5 seconds)
- ✅ Ensures data consistency across requests
- ✅ Handles concurrent requests properly
- ✅ Tests edge cases (large offsets)

#### Race Winners API Tests (`race-winners.spec.ts`)

Tests the race winners endpoint for specific seasons:

**GET `/f1/seasons/{season}/race-winners` - Season Race Winners**

- ✅ Returns race winners for valid seasons
- ✅ Validates RaceTable structure with season context
- ✅ Tests pagination parameters
- ✅ Validates comprehensive race data structure:
  - Race details (name, date, round, URL)
  - Circuit information (name, location, coordinates)
  - Winner details (driver, constructor, time)
  - Geographic coordinates validation (-90/90 lat, -180/180 long)
- ✅ Validates date format (YYYY-MM-DD) and accuracy
- ✅ Tests limit parameter boundaries (1-100)
- ✅ Rejects invalid parameters and season formats
- ✅ Handles non-existent and future seasons
- ✅ Validates reasonable race count per season (15-30 races)
- ✅ Ensures chronological race ordering
- ✅ Tests historical data (1950 season)
- ✅ Validates response performance (< 5 seconds)
- ✅ Ensures data consistency
- ✅ Tests concurrent requests for different seasons
- ✅ Validates pagination across multiple pages

### 3. Setup Tests (`apps/e2e/src/tests/setup/`)

#### Authentication Setup (`auth.setup.ts`)

Prepares authentication state for tests:

- ✅ Navigates to application successfully
- ✅ Verifies page loads correctly
- ✅ Saves authentication state for subsequent tests
- ✅ Handles authentication failures gracefully

## 🚀 Running Tests

### Prerequisites

1. **Services Running**: Ensure both frontend and backend are running
   ```bash
   npm run serve:web-app    # Frontend on :3000
   npm run serve:backend    # Backend on :4000
   ```

2. **Install Browsers**: Install Playwright browsers
   ```bash
   npm run e2e:install
   ```

### Test Execution Commands

```bash
# Run all E2E tests
npm run e2e

# Run tests with UI mode (interactive)
npm run e2e:ui

# Run tests in headed mode (visible browser)
npm run e2e:headed

# Run tests in debug mode
npm run e2e:debug

# Run only API tests
npm run e2e:api

# Browser-specific tests
npm run e2e:chrome        # Chrome only
npm run e2e:firefox       # Firefox only
npm run e2e:safari        # Safari/WebKit only

# Run mobile tests
npm run e2e:mobile

# View test report
npm run e2e:report
```

### Nx Commands

```bash
# Run specific test projects
npx nx e2e e2e                    # All tests
npx nx e2e-api e2e               # API tests only
npx nx e2e-chrome e2e            # Chrome tests only
npx nx e2e-firefox e2e           # Firefox tests only
npx nx e2e-safari e2e            # Safari/WebKit tests only
npx nx e2e-mobile e2e            # Mobile tests
```

## 🔧 Configuration

### Test Environment Variables

```bash
# Application URLs
BASE_URL=http://localhost:3000          # Frontend URL
API_BASE_URL=http://localhost:4000/api/v1  # Backend API URL

# Test Configuration
CI=false                               # Set to true in CI environment
```

### Browser Configuration

Tests run on multiple browsers and devices:

- **Desktop**: Chrome, Firefox, Safari
- **Mobile**: Mobile Chrome (Pixel 5), Mobile Safari (iPhone 12)
- **API**: Dedicated API testing context

### Reporting

Test results are generated in multiple formats:

- **HTML Report**: `playwright-report/index.html`
- **JSON Results**: `playwright-report/results.json`
- **JUnit XML**: `playwright-report/results.xml`
- **Screenshots**: `test-results/screenshots/`
- **Videos**: `test-results/` (on failures)

## 📊 Test Data and Validation

### API Response Validation

The tests validate responses against the [API specification](../../README_API_.md):

#### F1 Champions Data Structure

```typescript
interface ChampionResponse {
  MRData: {
    limit: string;
    offset: string;
    series: "f1";
    total: string;
    StandingsTable: {
      StandingsLists: Array<{
        season: string;
        round: string;
        DriverStandings: Array<{
          position: string;
          points: string;
          wins: string;
          Driver: DriverInfo;
          Constructors: ConstructorInfo[];
        }>;
      }>;
    };
  };
}
```

#### Race Winners Data Structure

```typescript
interface RaceWinnersResponse {
  MRData: {
    limit: string;
    offset: string;
    series: "f1";
    total: string;
    RaceTable: {
      season: string;
      Races: Array<{
        season: string;
        round: string;
        raceName: string;
        date: string; // YYYY-MM-DD format
        Circuit: {
          circuitId: string;
          circuitName: string;
          Location: {
            lat: string;
            long: string;
            locality: string;
            country: string;
          };
        };
        Results: WinnerInfo[];
      }>;
    };
  };
}
```

### Test Data Sets

#### Valid Test Scenarios

- **Seasons**: 2023, 2022, 2021, 2020, 1950
- **Pagination**: Various limit (1-100) and offset combinations
- **API Parameters**: Valid numeric and string formats

#### Invalid Test Scenarios

- **Invalid Seasons**: 'abc', '19', '99999', '1949', future years
- **Invalid Limits**: -1, 0, 101, 'abc'
- **Edge Cases**: Large offsets, empty results

## 🔍 Debugging and Troubleshooting

### Common Issues

1. **Services Not Running**
   ```
   Error: connect ECONNREFUSED
   ```
   **Solution**: Ensure frontend and backend services are running

2. **Browser Not Installed**
   ```
   Error: Browser not found
   ```
   **Solution**: Run `npm run e2e:install`

3. **Tests Timing Out**
   ```
   Error: Test timeout
   ```
   **Solution**: Check service health and increase timeout in config

### Debug Tools

1. **Interactive Mode**: `npm run e2e:ui`
2. **Debug Mode**: `npm run e2e:debug`
3. **Headed Mode**: `npm run e2e:headed`
4. **Test Traces**: Available in HTML report
5. **Screenshots**: Captured on failures

### Logs and Reports

- **Console Output**: Real-time test execution logs
- **HTML Report**: Detailed test results with traces
- **Screenshots**: Visual evidence of failures
- **Network Logs**: API request/response details in traces

## 📈 Maintenance and Updates

### Adding New Tests

1. **UI Tests**: Add to `src/tests/ui/` following page object pattern
2. **API Tests**: Add to `src/tests/api/` following endpoint structure
3. **Page Objects**: Add to `src/pages/` extending `BasePage`
4. **Utilities**: Add shared functions to `src/utils/`

### Best Practices

1. **Use Page Object Model** for UI tests
2. **Validate complete data structures** in API tests
3. **Test both happy path and error scenarios**
4. **Include performance assertions** (response times)
5. **Test data consistency** across multiple requests
6. **Use descriptive test names** and comments
7. **Group related tests** in describe blocks
8. **Clean up test data** in teardown

### CI/CD Integration

The test suite is designed for CI/CD environments:

- **Parallel execution** for faster results
- **Multiple output formats** for integration
- **Retry logic** for flaky tests
- **Environment variable** configuration
- **Dependency management** with service health checks

---

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev/)
- [F1 Champions API Documentation](../../README_API_.md)
- [Nx Playwright Plugin](https://nx.dev/nx-api/playwright)
- [Test Best Practices](https://playwright.dev/docs/best-practices)

---

*This documentation is maintained alongside the test suite and should be updated when tests are added or modified.* 

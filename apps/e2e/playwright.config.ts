import { defineConfig, devices } from '@playwright/test';
import { TEST_CONFIG } from '@/constants';

// Get browsers to test from environment variable
const BROWSERS = process.env.E2E_TEST_BROWSERS?.split(',') || ['chromium'];

const definedBrowsers = BROWSERS.map((browser) => ({
  name: browser,
  use: {
    ...devices[browser]
  }
}));

/**
 * Configuration for F1 Champions App E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Global test directory
  testDir: './src/tests',

  // Run tests in files in parallel
  fullyParallel: false,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: TEST_CONFIG.IS_CI,

  // Retry on CI only
  retries: TEST_CONFIG.IS_CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: TEST_CONFIG.IS_CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html', { outputDir: 'playwright-report' }],
    ['json', { outputFile: 'playwright-report/results.json' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }],
    ['list'],
  ],

  // Shared settings for all projects
  use: {
    // Base URL for the app
    baseURL: TEST_CONFIG.FRONTEND_URL,

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Record video only when retrying
    video: 'retain-on-failure',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,

    // API base URL for API tests
    extraHTTPHeaders: {
      // Add any default headers here
    },
  },

  // Global setup and teardown
  globalSetup: require.resolve('./src/utils/global-setup.ts'),
  globalTeardown: require.resolve('./src/utils/global-teardown.ts'),

  // Configure projects for major browsers
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    ...definedBrowsers,
    // API testing project
    {
      name: 'api',
      testDir: './src/tests/api',
      use: {
        baseURL: TEST_CONFIG.API_BASE_URL,
      },
    },
  ],

  // Output directory for test results
  outputDir: 'test-results/',

  // Test timeout
  timeout: TEST_CONFIG.TIMEOUTS.DEFAULT,
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: TEST_CONFIG.TIMEOUTS.ELEMENT_WAIT,
  },
});

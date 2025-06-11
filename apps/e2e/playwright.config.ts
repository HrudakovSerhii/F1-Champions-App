import { defineConfig, devices } from '@playwright/test';
import { TEST_CONFIG } from '@/constants';

/**
 * Configuration for F1 Champions App E2E Tests
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Global test directory
  testDir: './src/tests',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

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

    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'webkit',
      use: {
        ...devices['Desktop Safari'],
      },
      dependencies: ['setup'],
    },

    // Mobile browsers
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
      },
      dependencies: ['setup'],
    },

    {
      name: 'Mobile Safari',
      use: {
        ...devices['iPhone 12'],
      },
      dependencies: ['setup'],
    },

    // API testing project
    {
      name: 'api',
      testDir: './src/tests/api',
      use: {
        baseURL: TEST_CONFIG.API_BASE_URL,
      },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: [
    {
      command: 'npm run serve:web-app',
      url: TEST_CONFIG.FRONTEND_URL,
      reuseExistingServer: !TEST_CONFIG.IS_CI,
      timeout: 120 * 1000,
    },
    {
      command: 'npm run serve:backend',
      url: `${TEST_CONFIG.API_BASE_URL}/health`,
      reuseExistingServer: !TEST_CONFIG.IS_CI,
      timeout: 120 * 1000,
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

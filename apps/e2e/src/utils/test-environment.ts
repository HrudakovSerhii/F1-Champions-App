import { request } from '@playwright/test';
import { TEST_CONFIG, validateConfig } from '@/constants';

/**
 * Test environment utilities for managing E2E test setup
 */
export class TestEnvironment {
  private readonly baseURL: string;
  private readonly apiURL: string;

  constructor() {
    this.baseURL = TEST_CONFIG.FRONTEND_URL;
    this.apiURL = TEST_CONFIG.API_BASE_URL;

    // Validate configuration on initialization
    if (TEST_CONFIG.IS_DEBUG) {
      validateConfig();
    }
  }

  /**
   * Wait for all required services to be ready
   */
  async waitForServices(): Promise<void> {
    console.log('⏳ Waiting for services to be ready...');

    const maxRetries = 30;
    const retryDelay = 2000; // 2 seconds

    // Check frontend
    await this.waitForService(this.baseURL, 'Frontend', maxRetries, retryDelay);

    // Check backend API
    await this.waitForService(
      `${this.apiURL}/health`,
      'Backend API',
      maxRetries,
      retryDelay
    );

    console.log('✅ All services are ready');
  }

  /**
   * Wait for a specific service to be ready
   */
  private async waitForService(
    url: string,
    serviceName: string,
    maxRetries: number,
    retryDelay: number
  ): Promise<void> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        const context = await request.newContext();
        const response = await context.get(url, {
          timeout: 5000,
          ignoreHTTPSErrors: true,
        });

        if (response.ok()) {
          console.log(`✅ ${serviceName} is ready`);
          await context.dispose();
          return;
        }

        await context.dispose();
      } catch (error) {
        // Service not ready, continue retrying
        console.log(
          `Service not ready, continue retrying after error: ${error}`
        );
      }

      if (i < maxRetries - 1) {
        console.log(
          `⏳ ${serviceName} not ready, retrying in ${retryDelay / 1000}s... (${
            i + 1
          }/${maxRetries})`
        );
        await this.sleep(retryDelay);
      }
    }

    throw new Error(
      `❌ ${serviceName} failed to start after ${maxRetries} attempts`
    );
  }

  /**
   * Setup test data
   */
  async setupTestData(): Promise<void> {
    console.log('⏳ Setting up test data...');

    try {
      // Add any test data setup logic here
      // For example, creating test users, seeding database, etc.

      // Verify API endpoints are working
      await this.verifyApiEndpoints();

      console.log('✅ Test data setup completed');
    } catch (error) {
      console.error('❌ Test data setup failed:', error);
      throw error;
    }
  }

  /**
   * Verify critical API endpoints are working
   */
  private async verifyApiEndpoints(): Promise<void> {
    const context = await request.newContext();

    try {
      // Test health endpoint
      const healthResponse = await context.get(`${this.apiURL}/health`);
      if (!healthResponse.ok()) {
        throw new Error(`Health check failed: ${healthResponse.status()}`);
      }

      // Test API info endpoint
      const infoResponse = await context.get(`${this.apiURL}/`);
      if (!infoResponse.ok()) {
        throw new Error(`API info endpoint failed: ${infoResponse.status()}`);
      }

      // Test champions endpoint
      const championsResponse = await context.get(
        `${this.apiURL}/f1/champions?limit=1`
      );
      if (!championsResponse.ok()) {
        throw new Error(
          `Champions endpoint failed: ${championsResponse.status()}`
        );
      }

      console.log('✅ API endpoints verification completed');
    } finally {
      await context.dispose();
    }
  }

  /**
   * Clean up test data
   */
  async cleanupTestData(): Promise<void> {
    console.log('🧹 Cleaning up test data...');

    try {
      // Add any cleanup logic here
      // For example, removing test users, cleaning database, etc.

      console.log('✅ Test data cleanup completed');
    } catch (error) {
      console.error('❌ Test data cleanup failed:', error);
      // Don't throw here to avoid masking test failures
    }
  }

  /**
   * Utility method to sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

import { TestEnvironment } from './test-environment';

/**
 * Global teardown for E2E tests
 */
async function globalTeardown() {
  console.log('🧹 Starting global E2E test teardown...');

  const testEnv = new TestEnvironment();

  try {
    // Clean up test data
    await testEnv.cleanupTestData();

    // Additional cleanup tasks can be added here
    // For example: stopping test servers, cleaning temporary files, etc.

    console.log('✅ Global E2E test teardown completed successfully');
  } catch (error) {
    console.error('❌ Global E2E test teardown failed:', error);
    // Don't throw to avoid masking test results
  }
}

export default globalTeardown;

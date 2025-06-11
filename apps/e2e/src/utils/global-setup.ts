import { TestEnvironment } from './test-environment';

/**
 * Global setup for E2E tests
 */
async function globalSetup() {
  console.log('🚀 Starting global E2E test setup...');

  // Initialize test environment
  const testEnv = new TestEnvironment();

  try {
    // Wait for services to be ready
    await testEnv.waitForServices();

    // Setup test data
    await testEnv.setupTestData();

    console.log('✅ Global E2E test setup completed successfully');
  } catch (error) {
    console.error('❌ Global E2E test setup failed:', error);
    throw error;
  }
}

export default globalSetup;

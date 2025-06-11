import { test as setup, expect } from '@playwright/test';

// No authentication required for this app
// This setup just ensures the app loads correctly
setup('authenticate', async ({ page }) => {
  console.log('🔐 Setting up application state...');

  try {
    // Navigate to the app
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if the app loads successfully
    const title = await page.title();
    expect(title).toBeTruthy();

    // Since there's no authentication, we don't need to save any auth state
    // The app is publicly accessible

    console.log('✅ Application state setup completed');
  } catch (error) {
    console.error('❌ Application state setup failed:', error);
    throw error;
  }
});

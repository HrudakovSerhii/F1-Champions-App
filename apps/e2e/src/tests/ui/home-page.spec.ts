import { test, expect } from '@playwright/test';
import { HomePage } from '@/pages/home-page';

test.describe('F1 Champions App - Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHome();
  });

  test('should load home page successfully', async () => {
    // Assert page loads and displays correctly
    await homePage.assertPageIsLoaded();

    // Check page title
    const title = await homePage.getTitle();
    expect(title).toContain('F1');

    // Verify no error messages
    await homePage.assertNoErrors();
  });

  test('should display page header', async () => {
    // Check if page header is visible
    const headerVisible = await homePage.isPageHeaderVisible();
    expect(headerVisible).toBe(true);

    // Verify header text contains relevant content
    const headerText = await homePage.getPageHeaderText();
    expect(headerText.toLowerCase()).toMatch(/f1|formula|champion/);
  });

  test('should display navigation menu', async () => {
    // Check if navigation is visible
    const navVisible = await homePage.isNavigationVisible();
    expect(navVisible).toBe(true);
  });

  test('should display champions section', async () => {
    // Wait for champions to load
    await homePage.waitForChampionsToLoad();

    // Check if champions section is visible
    const sectionVisible = await homePage.isChampionsSectionVisible();
    expect(sectionVisible).toBe(true);

    // Check if champions list is visible
    const listVisible = await homePage.isChampionsListVisible();
    expect(listVisible).toBe(true);
  });

  test('should load champions data', async () => {
    // Wait for champions data to load
    await homePage.waitForChampionsToLoad();

    // Check that we have champions displayed
    const championsCount = await homePage.getChampionsCount();
    expect(championsCount).toBeGreaterThan(0);

    // Verify first champion has valid data
    const firstChampion = await homePage.getChampionDetails(0);
    expect(firstChampion.name || firstChampion.season).toBeTruthy();
  });

  test('should handle search functionality if available', async () => {
    // Wait for page to load
    await homePage.waitForPageToLoad();

    // Try to search (this will be a no-op if search doesn't exist)
    await homePage.searchChampions('Hamilton');

    // Verify no errors occurred
    await homePage.assertNoErrors();
  });

  test('should handle season filtering if available', async () => {
    // Wait for page to load
    await homePage.waitForPageToLoad();

    // Try to filter by season (this will be a no-op if filter doesn't exist)
    await homePage.filterBySeason('2023');

    // Verify no errors occurred
    await homePage.assertNoErrors();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to home page
    await homePage.navigateToHome();

    // Verify page loads correctly on mobile
    await homePage.assertPageIsLoaded();

    // Check that essential elements are still visible
    const headerVisible = await homePage.isPageHeaderVisible();
    expect(headerVisible).toBe(true);

    // Verify no errors
    await homePage.assertNoErrors();
  });

  test('should handle page refresh', async () => {
    // Wait for initial load
    await homePage.waitForPageToLoad();

    // Refresh the page
    await homePage.refresh();

    // Verify page loads correctly after refresh
    await homePage.assertPageIsLoaded();
    await homePage.assertNoErrors();
  });

  test('should take screenshot on failure', async () => {
    // This test will demonstrate screenshot capability
    await homePage.waitForPageToLoad();

    // Take a screenshot for verification
    await homePage.takeScreenshot('home-page-loaded');

    // This assertion should pass
    const headerVisible = await homePage.isPageHeaderVisible();
    expect(headerVisible).toBe(true);
  });
});

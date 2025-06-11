import { test, expect } from '@playwright/test';
import { HomePage } from '@/pages/home-page';
import { TEST_IDS, getListItemTestId } from '@f1-app/e2e-testids';

test.describe('F1 Champions App - Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHome();
  });

  test('should load home page successfully', async ({ page }) => {
    // Assert page loads and displays correctly using TEST_IDS
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();

    // Check page title
    const pageTitle = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_TITLE}"]`
    );
    await expect(pageTitle).toBeVisible();

    const title = await pageTitle.textContent();
    expect(title).toContain('F1');

    // Verify no error messages using standardized error test ID
    const errorMessage = page.locator(
      `[data-testid="${TEST_IDS.COMMON.ERROR_MESSAGE}"]`
    );
    await expect(errorMessage).not.toBeVisible();
  });

  test('should display page header with navigation', async ({ page }) => {
    // Check if page header is visible
    const pageHeader = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`
    );
    await expect(pageHeader).toBeVisible();

    // Check navigation menu
    const navigationMenu = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.NAVIGATION_MENU}"]`
    );
    await expect(navigationMenu).toBeVisible();

    // Check specific navigation links
    await expect(
      page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.NAV_HOME_LINK}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.NAV_CHAMPIONS_LINK}"]`)
    ).toBeVisible();
    await expect(
      page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.NAV_SEASONS_LINK}"]`)
    ).toBeVisible();
  });

  test('should display champions section', async ({ page }) => {
    // Wait for champions section to load
    const championsSection = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`
    );
    await championsSection.waitFor();
    await expect(championsSection).toBeVisible();

    // Check champions title
    const championsTitle = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_TITLE}"]`
    );
    await expect(championsTitle).toBeVisible();

    // Check champions list
    const championsList = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_LIST}"]`
    );
    await expect(championsList).toBeVisible();
  });

  test('should load and display champion cards', async ({ page }) => {
    // Wait for champions data to load
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`)
      .waitFor();

    // Check that we have champion cards displayed
    const championCards = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONTAINER}"]`
    );
    await expect(championCards.first()).toBeVisible();

    const championsCount = await championCards.count();
    expect(championsCount).toBeGreaterThan(0);

    // Verify first champion card has valid data
    const firstChampionCard = championCards.first();

    // Check driver name is present
    const driverName = firstChampionCard.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.DRIVER_NAME}"]`
    );
    await expect(driverName).toBeVisible();

    // Check season year is present
    const seasonYear = firstChampionCard.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.SEASON_YEAR}"]`
    );
    await expect(seasonYear).toBeVisible();

    // Check view details button
    const viewDetailsButton = firstChampionCard.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS}"]`
    );
    await expect(viewDetailsButton).toBeVisible();
  });

  test('should handle champion card interactions', async ({ page }) => {
    // Wait for champions to load
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`)
      .waitFor();

    // Test clicking on a specific champion card using list item helper
    const secondChampionCard = page.locator(
      `[data-testid="${getListItemTestId(
        TEST_IDS.HOME_SCREEN.CHAMPION_CARD.CONTAINER,
        1
      )}"]`
    );

    if ((await secondChampionCard.count()) > 0) {
      const viewDetailsButton = secondChampionCard.locator(
        `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPION_CARD.VIEW_DETAILS}"]`
      );
      await viewDetailsButton.click();

      // Verify navigation occurred (URL change or new page load)
      // Note: This depends on how navigation is implemented
    }
  });

  test('should handle search functionality if available', async ({ page }) => {
    // Wait for page to load
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();

    // Try to interact with search elements if they exist
    const searchInput = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.SEARCH_INPUT}"]`
    );
    const searchButton = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.SEARCH_BUTTON}"]`
    );

    // Only test if search elements are present
    if ((await searchInput.count()) > 0) {
      await searchInput.fill('Hamilton');

      if ((await searchButton.count()) > 0) {
        await searchButton.click();
      }
    }

    // Verify no errors occurred
    const errorMessage = page.locator(
      `[data-testid="${TEST_IDS.COMMON.ERROR_MESSAGE}"]`
    );
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle filters if available', async ({ page }) => {
    // Wait for page to load
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();

    // Try to interact with filter elements if they exist
    const seasonFilter = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.SEASON_FILTER}"]`
    );
    const constructorFilter = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CONSTRUCTOR_FILTER}"]`
    );

    // Only test if filter elements are present
    if ((await seasonFilter.count()) > 0) {
      await seasonFilter.selectOption('2023');
    }

    if ((await constructorFilter.count()) > 0) {
      await constructorFilter.selectOption('Mercedes');
    }

    // Verify no errors occurred
    const errorMessage = page.locator(
      `[data-testid="${TEST_IDS.COMMON.ERROR_MESSAGE}"]`
    );
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle loading states', async ({ page }) => {
    // Navigate to page and check for loading spinner
    await page.goto('/');

    // Loading spinner might be visible initially
    const loadingSpinner = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.LOADING_SPINNER}"]`
    );

    // Wait for loading to complete and content to appear
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`)
      .waitFor();

    // Loading spinner should be hidden after content loads
    await expect(loadingSpinner).not.toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Navigate to home page
    await page.goto('/');

    // Verify page loads correctly on mobile using test IDs
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();

    // Check that essential elements are still visible
    const pageHeader = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`
    );
    await expect(pageHeader).toBeVisible();

    const championsSection = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`
    );
    await expect(championsSection).toBeVisible();

    // Verify no errors
    const errorMessage = page.locator(
      `[data-testid="${TEST_IDS.COMMON.ERROR_MESSAGE}"]`
    );
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle page refresh', async ({ page }) => {
    // Wait for initial load using test IDs
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();

    // Refresh the page
    await page.reload();

    // Verify page loads correctly after refresh
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGE_HEADER}"]`)
      .waitFor();
    await expect(
      page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`)
    ).toBeVisible();

    // Verify no errors
    const errorMessage = page.locator(
      `[data-testid="${TEST_IDS.COMMON.ERROR_MESSAGE}"]`
    );
    await expect(errorMessage).not.toBeVisible();
  });

  test('should handle pagination if available', async ({ page }) => {
    // Wait for page to load
    await page
      .locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_SECTION}"]`)
      .waitFor();

    // Check if pagination exists
    const paginationContainer = page.locator(
      `[data-testid="${TEST_IDS.HOME_SCREEN.PAGINATION.CONTAINER}"]`
    );

    if ((await paginationContainer.count()) > 0) {
      // Test pagination controls
      const nextButton = page.locator(
        `[data-testid="${TEST_IDS.HOME_SCREEN.PAGINATION.NEXT_BUTTON}"]`
      );
      // const previousButton = page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.PAGINATION.PREVIOUS_BUTTON}"]`);

      if ((await nextButton.count()) > 0 && (await nextButton.isEnabled())) {
        await nextButton.click();

        // Wait for page change
        await page.waitForTimeout(1000);

        // Verify content updated
        await expect(
          page.locator(`[data-testid="${TEST_IDS.HOME_SCREEN.CHAMPIONS_LIST}"]`)
        ).toBeVisible();
      }
    }
  });
});

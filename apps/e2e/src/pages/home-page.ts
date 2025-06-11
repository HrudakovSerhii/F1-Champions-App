import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Home page object for F1 Champions App
 */
export class HomePage extends BasePage {
  // Selectors
  private readonly pageHeader: Locator;
  private readonly navigationMenu: Locator;
  private readonly championsSection: Locator;
  private readonly loadingSpinner: Locator;
  private readonly errorMessage: Locator;
  private readonly championsList: Locator;
  private readonly searchInput: Locator;
  private readonly seasonFilter: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize selectors
    this.pageHeader = page.locator('[data-testid="page-header"], h1, .header');
    this.navigationMenu = page.locator('[data-testid="navigation"], nav, .nav');
    this.championsSection = page.locator(
      '[data-testid="champions-section"], .champions, #champions'
    );
    this.loadingSpinner = page.locator(
      '[data-testid="loading"], .loading, .spinner'
    );
    this.errorMessage = page.locator(
      '[data-testid="error"], .error, .alert-error'
    );
    this.championsList = page.locator(
      '[data-testid="champions-list"], .champions-list, .list'
    );
    this.searchInput = page.locator(
      '[data-testid="search"], input[type="search"], .search-input'
    );
    this.seasonFilter = page.locator(
      '[data-testid="season-filter"], select, .season-select'
    );
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/');
  }

  /**
   * Wait for page to load completely
   */
  async waitForPageToLoad(): Promise<void> {
    await this.waitForPageLoad();

    // Wait for loading spinner to disappear if present
    if (await this.isElementVisible(this.loadingSpinner)) {
      await this.waitForElementToBeHidden(this.loadingSpinner);
    }
  }

  /**
   * Check if page header is visible
   */
  async isPageHeaderVisible(): Promise<boolean> {
    return await this.isElementVisible(this.pageHeader);
  }

  /**
   * Get page header text
   */
  async getPageHeaderText(): Promise<string> {
    return await this.getElementText(this.pageHeader);
  }

  /**
   * Check if navigation menu is visible
   */
  async isNavigationVisible(): Promise<boolean> {
    return await this.isElementVisible(this.navigationMenu);
  }

  /**
   * Check if champions section is visible
   */
  async isChampionsSectionVisible(): Promise<boolean> {
    return await this.isElementVisible(this.championsSection);
  }

  /**
   * Check if champions list is loaded
   */
  async isChampionsListVisible(): Promise<boolean> {
    return await this.isElementVisible(this.championsList);
  }

  /**
   * Get number of champions displayed
   */
  async getChampionsCount(): Promise<number> {
    const champions = this.championsList.locator(
      '[data-testid="champion-item"], .champion-item, .list-item'
    );
    return await champions.count();
  }

  /**
   * Search for champions
   */
  async searchChampions(searchTerm: string): Promise<void> {
    if (await this.isElementVisible(this.searchInput)) {
      await this.fillInput(this.searchInput, searchTerm);
      await this.page.waitForTimeout(500); // Wait for search debounce
    }
  }

  /**
   * Filter by season
   */
  async filterBySeason(season: string): Promise<void> {
    if (await this.isElementVisible(this.seasonFilter)) {
      await this.clickElement(this.seasonFilter);
      await this.seasonFilter.selectOption(season);
      await this.page.waitForTimeout(500); // Wait for filter to apply
    }
  }

  /**
   * Check if error message is displayed
   */
  async isErrorMessageVisible(): Promise<boolean> {
    return await this.isElementVisible(this.errorMessage);
  }

  /**
   * Get error message text
   */
  async getErrorMessageText(): Promise<string> {
    return await this.getElementText(this.errorMessage);
  }

  /**
   * Wait for champions data to load
   */
  async waitForChampionsToLoad(): Promise<void> {
    // Wait for API response
    await this.waitForResponse(/\/api\/v1\/f1\/champions/);

    // Wait for champions list to be visible
    await this.waitForElement(this.championsList);
  }

  /**
   * Get champion details by index
   */
  async getChampionDetails(index: number): Promise<{
    name?: string;
    season?: string;
    team?: string;
  }> {
    const champion = this.championsList
      .locator('[data-testid="champion-item"], .champion-item')
      .nth(index);

    // @typescript-eslint/ban-ts-comment @ts-expect-error: no need to create type for such object
    const details: any = {};

    // Try to get champion name
    const nameElement = champion.locator(
      '[data-testid="champion-name"], .name, .driver-name'
    );
    if (await this.isElementVisible(nameElement)) {
      details.name = await this.getElementText(nameElement);
    }

    // Try to get season
    const seasonElement = champion.locator(
      '[data-testid="champion-season"], .season, .year'
    );
    if (await this.isElementVisible(seasonElement)) {
      details.season = await this.getElementText(seasonElement);
    }

    // Try to get team
    const teamElement = champion.locator(
      '[data-testid="champion-team"], .team, .constructor'
    );
    if (await this.isElementVisible(teamElement)) {
      details.team = await this.getElementText(teamElement);
    }

    return details;
  }

  /**
   * Click on a champion to view details
   */
  async clickChampion(index: number): Promise<void> {
    const champion = this.championsList
      .locator('[data-testid="champion-item"], .champion-item')
      .nth(index);
    await this.clickElement(champion);
  }

  /**
   * Assert page is loaded correctly
   */
  async assertPageIsLoaded(): Promise<void> {
    await this.assertElementVisible(this.pageHeader);
    await this.waitForChampionsToLoad();
    await this.assertElementVisible(this.championsList);
  }

  /**
   * Assert no error messages are displayed
   */
  async assertNoErrors(): Promise<void> {
    const isErrorVisible = await this.isErrorMessageVisible();
    if (isErrorVisible) {
      const errorText = await this.getErrorMessageText();
      throw new Error(`Unexpected error message: ${errorText}`);
    }
  }
}

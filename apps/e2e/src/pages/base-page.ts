import { Page, Locator, expect } from '@playwright/test';

/**
 * Base page class with common functionality for all page objects
 */
export abstract class BasePage {
  protected page: Page;

  protected constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string): Promise<void> {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Wait for page to fully load
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get page title
   */
  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Take a screenshot
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(locator: Locator, timeout = 5000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementToBeHidden(
    locator: Locator,
    timeout = 5000
  ): Promise<void> {
    await locator.waitFor({ state: 'hidden', timeout });
  }

  /**
   * Click element with retry logic
   */
  async clickElement(locator: Locator, retries = 3): Promise<void> {
    for (let i = 0; i < retries; i++) {
      try {
        await this.waitForElement(locator);
        await locator.click();
        return;
      } catch (error) {
        if (i === retries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }

  /**
   * Fill input field
   */
  async fillInput(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  /**
   * Get text content of an element
   */
  async getElementText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return (await locator.textContent()) || '';
  }

  /**
   * Check if element exists
   */
  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await locator.waitFor({ state: 'visible', timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Scroll element into view
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Wait for API response
   */
  async waitForResponse(
    urlPattern: string | RegExp,
    timeout = 10000
  ): Promise<void> {
    await this.page.waitForResponse(urlPattern, { timeout });
  }

  /**
   * Refresh the page
   */
  async refresh(): Promise<void> {
    await this.page.reload();
    await this.waitForPageLoad();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    await this.waitForPageLoad();
  }

  /**
   * Assert page title
   */
  async assertPageTitle(expectedTitle: string): Promise<void> {
    const title = await this.getTitle();
    expect(title).toBe(expectedTitle);
  }

  /**
   * Assert URL contains text
   */
  async assertUrlContains(text: string): Promise<void> {
    expect(this.getCurrentUrl()).toContain(text);
  }

  /**
   * Assert element is visible
   */
  async assertElementVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  /**
   * Assert element text
   */
  async assertElementText(
    locator: Locator,
    expectedText: string
  ): Promise<void> {
    await expect(locator).toHaveText(expectedText);
  }

  /**
   * Assert element contains text
   */
  async assertElementContainsText(
    locator: Locator,
    text: string
  ): Promise<void> {
    await expect(locator).toContainText(text);
  }
}

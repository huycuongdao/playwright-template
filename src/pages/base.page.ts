import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  abstract get url(): string;

  async navigate(): Promise<void> {
    await this.page.goto(this.url);
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getUrl(): Promise<string> {
    return this.page.url();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png`, fullPage: true });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async waitForElement(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor({ state: 'visible', ...options });
  }

  async waitForElementToDisappear(locator: Locator, options?: { timeout?: number }): Promise<void> {
    await locator.waitFor({ state: 'hidden', ...options });
  }

  async clickAndWait(locator: Locator, waitForSelector?: string): Promise<void> {
    await Promise.all([
      waitForSelector ? this.page.waitForSelector(waitForSelector) : this.page.waitForLoadState('networkidle'),
      locator.click(),
    ]);
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  async clearAndFill(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string | string[]): Promise<void> {
    await locator.selectOption(value);
  }

  async checkCheckbox(locator: Locator): Promise<void> {
    await locator.check();
  }

  async uncheckCheckbox(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  async getText(locator: Locator): Promise<string> {
    return locator.textContent() ?? '';
  }

  async getValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    return locator.isEnabled();
  }

  async isChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }

  async expectToBeVisible(locator: Locator): Promise<void> {
    await expect(locator).toBeVisible();
  }

  async expectToHaveText(locator: Locator, text: string | RegExp): Promise<void> {
    await expect(locator).toHaveText(text);
  }

  async expectToHaveValue(locator: Locator, value: string | RegExp): Promise<void> {
    await expect(locator).toHaveValue(value);
  }

  async expectToBeEnabled(locator: Locator): Promise<void> {
    await expect(locator).toBeEnabled();
  }

  async expectToBeDisabled(locator: Locator): Promise<void> {
    await expect(locator).toBeDisabled();
  }

  async expectToBeChecked(locator: Locator): Promise<void> {
    await expect(locator).toBeChecked();
  }

  async expectUrlToContain(text: string): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  async expectTitleToContain(text: string): Promise<void> {
    await expect(this.page).toHaveTitle(new RegExp(text));
  }
}
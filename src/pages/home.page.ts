import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly navBar: Locator;
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly loginLink: Locator;
  readonly signupLink: Locator;
  readonly heroSection: Locator;
  readonly featuredProducts: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    super(page);
    this.navBar = page.locator('nav[role="navigation"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.searchButton = page.locator('[data-testid="search-button"]');
    this.loginLink = page.locator('[data-testid="login-link"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
    this.heroSection = page.locator('[data-testid="hero-section"]');
    this.featuredProducts = page.locator('[data-testid="featured-products"]');
    this.footer = page.locator('footer');
  }

  get url(): string {
    return '/';
  }

  async search(searchTerm: string): Promise<void> {
    await this.fillField(this.searchInput, searchTerm);
    await this.searchButton.click();
  }

  async goToLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async goToSignup(): Promise<void> {
    await this.signupLink.click();
  }

  async selectFeaturedProduct(productName: string): Promise<void> {
    const product = this.featuredProducts.locator(`[data-product-name="${productName}"]`);
    await product.click();
  }

  async verifyHomepageElements(): Promise<void> {
    await this.expectToBeVisible(this.navBar);
    await this.expectToBeVisible(this.searchInput);
    await this.expectToBeVisible(this.heroSection);
    await this.expectToBeVisible(this.featuredProducts);
  }
}
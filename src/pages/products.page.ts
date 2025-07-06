import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductsPage extends BasePage {
  readonly productGrid: Locator;
  readonly productCards: Locator;
  readonly sortDropdown: Locator;
  readonly filterSidebar: Locator;
  readonly priceRangeMin: Locator;
  readonly priceRangeMax: Locator;
  readonly categoryFilters: Locator;
  readonly applyFiltersButton: Locator;
  readonly clearFiltersButton: Locator;
  readonly searchBar: Locator;
  readonly pagination: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    super(page);
    this.productGrid = page.locator('[data-testid="product-grid"]');
    this.productCards = page.locator('[data-testid="product-card"]');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    this.filterSidebar = page.locator('[data-testid="filter-sidebar"]');
    this.priceRangeMin = page.locator('[data-testid="price-range-min"]');
    this.priceRangeMax = page.locator('[data-testid="price-range-max"]');
    this.categoryFilters = page.locator('[data-testid="category-filter"]');
    this.applyFiltersButton = page.locator('[data-testid="apply-filters"]');
    this.clearFiltersButton = page.locator('[data-testid="clear-filters"]');
    this.searchBar = page.locator('[data-testid="products-search"]');
    this.pagination = page.locator('[data-testid="pagination"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
  }

  get url(): string {
    return '/products';
  }

  async waitForProductsToLoad(): Promise<void> {
    await this.waitForElementToDisappear(this.loadingSpinner);
    await this.waitForElement(this.productGrid);
  }

  async getProductCount(): Promise<number> {
    await this.waitForProductsToLoad();
    return this.productCards.count();
  }

  async selectProduct(index: number): Promise<void> {
    await this.productCards.nth(index).click();
  }

  async selectProductByName(name: string): Promise<void> {
    await this.page.locator(`[data-product-name="${name}"]`).click();
  }

  async sortBy(option: string): Promise<void> {
    await this.selectOption(this.sortDropdown, option);
    await this.waitForProductsToLoad();
  }

  async filterByPriceRange(min: string, max: string): Promise<void> {
    await this.clearAndFill(this.priceRangeMin, min);
    await this.clearAndFill(this.priceRangeMax, max);
  }

  async filterByCategory(category: string): Promise<void> {
    const categoryCheckbox = this.categoryFilters.locator(`text="${category}"`);
    await this.checkCheckbox(categoryCheckbox);
  }

  async applyFilters(): Promise<void> {
    await this.applyFiltersButton.click();
    await this.waitForProductsToLoad();
  }

  async clearFilters(): Promise<void> {
    await this.clearFiltersButton.click();
    await this.waitForProductsToLoad();
  }

  async searchProducts(searchTerm: string): Promise<void> {
    await this.clearAndFill(this.searchBar, searchTerm);
    await this.searchBar.press('Enter');
    await this.waitForProductsToLoad();
  }

  async goToPage(pageNumber: number): Promise<void> {
    const pageButton = this.pagination.locator(`[data-page="${pageNumber}"]`);
    await pageButton.click();
    await this.waitForProductsToLoad();
  }

  async getProductInfo(index: number): Promise<{
    name: string;
    price: string;
    rating: string;
  }> {
    const product = this.productCards.nth(index);
    const name = await product.locator('[data-testid="product-name"]').textContent() ?? '';
    const price = await product.locator('[data-testid="product-price"]').textContent() ?? '';
    const rating = await product.locator('[data-testid="product-rating"]').textContent() ?? '';
    
    return { name, price, rating };
  }

  async addToCart(index: number): Promise<void> {
    const addToCartButton = this.productCards.nth(index).locator('[data-testid="add-to-cart"]');
    await addToCartButton.click();
  }

  async quickView(index: number): Promise<void> {
    const quickViewButton = this.productCards.nth(index).locator('[data-testid="quick-view"]');
    await quickViewButton.click();
  }
}
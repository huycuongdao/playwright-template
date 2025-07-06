import { test as base, Page } from '@playwright/test';
import { HomePage, LoginPage, ProductsPage } from '@pages/index';
import { testConfig } from '@/config/test.config';

type PageObjects = {
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

type TestFixtures = {
  authenticatedPage: Page;
} & PageObjects;

export const test = base.extend<TestFixtures>({
  // Page object fixtures
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },

  // Authenticated page fixture
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'auth.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

// Custom test with automatic login
export const authenticatedTest = base.extend<TestFixtures>({
  page: async ({ browser }, use) => {
    // Create a new context with saved auth state
    const context = await browser.newContext({
      storageState: 'auth.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
  
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  productsPage: async ({ page }, use) => {
    const productsPage = new ProductsPage(page);
    await use(productsPage);
  },
});
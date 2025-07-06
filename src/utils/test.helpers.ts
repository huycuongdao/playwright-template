import { Page, expect } from '@playwright/test';

export class TestHelpers {
  static async waitForPageReady(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
    await page.waitForLoadState('networkidle');
  }

  static async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delay = 1000,
  ): Promise<T> {
    let lastError: Error | undefined;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        if (i < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError;
  }

  static generateRandomEmail(): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `test_${timestamp}_${random}@example.com`;
  }

  static generateRandomString(length = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  static generateRandomNumber(min = 0, max = 100): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async takeScreenshotOnFailure(page: Page, testName: string): Promise<void> {
    const screenshotPath = `screenshots/failures/${testName}-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
  }

  static async highlightElement(page: Page, selector: string): Promise<void> {
    await page.evaluate((sel) => {
      const element = document.querySelector(sel);
      if (element) {
        element.style.border = '2px solid red';
        element.style.backgroundColor = 'yellow';
      }
    }, selector);
  }

  static async scrollToBottom(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
  }

  static async scrollToTop(page: Page): Promise<void> {
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
  }

  static async waitForAnimation(page: Page, duration = 500): Promise<void> {
    await page.waitForTimeout(duration);
  }

  static formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  }

  static parsePrice(priceString: string): number {
    return parseFloat(priceString.replace(/[^0-9.-]+/g, ''));
  }

  static async clearLocalStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      localStorage.clear();
    });
  }

  static async clearSessionStorage(page: Page): Promise<void> {
    await page.evaluate(() => {
      sessionStorage.clear();
    });
  }

  static async clearCookies(page: Page): Promise<void> {
    const context = page.context();
    await context.clearCookies();
  }

  static async setLocalStorageItem(page: Page, key: string, value: string): Promise<void> {
    await page.evaluate(({ k, v }) => {
      localStorage.setItem(k, v);
    }, { k: key, v: value });
  }

  static async getLocalStorageItem(page: Page, key: string): Promise<string | null> {
    return page.evaluate((k) => {
      return localStorage.getItem(k);
    }, key);
  }

  static async mockGeolocation(page: Page, latitude: number, longitude: number): Promise<void> {
    await page.context().setGeolocation({ latitude, longitude });
  }

  static async mockDate(page: Page, date: Date): Promise<void> {
    await page.addInitScript(`{
      Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            super(${date.getTime()});
          } else {
            super(...args);
          }
        }
      }
      const __DateNowOffset = ${date.getTime()} - Date.now();
      const __DateNow = Date.now;
      Date.now = () => __DateNow() + __DateNowOffset;
    }`);
  }
}
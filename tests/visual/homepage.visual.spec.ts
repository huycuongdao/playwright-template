import { test, expect } from '@/fixtures/test.fixtures';

test.describe('Homepage Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for animations to complete
    await page.waitForTimeout(1000);
  });

  test('should match homepage screenshot @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should match hero section screenshot', async ({ page, homePage }) => {
    await expect(homePage.heroSection).toHaveScreenshot('hero-section.png', {
      animations: 'disabled',
    });
  });

  test('should match navigation bar across viewports', async ({ page }) => {
    const viewports = [
      { width: 1920, height: 1080, name: 'desktop-full-hd' },
      { width: 1366, height: 768, name: 'desktop-standard' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 375, height: 667, name: 'mobile' },
    ];

    for (const viewport of viewports) {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500); // Wait for responsive adjustments
      
      await expect(page.locator('nav')).toHaveScreenshot(
        `navigation-${viewport.name}.png`,
        { animations: 'disabled' }
      );
    }
  });

  test('should match hover states', async ({ page }) => {
    // Test button hover state
    const button = page.locator('[data-testid="cta-button"]').first();
    await button.hover();
    await expect(button).toHaveScreenshot('button-hover.png');

    // Test link hover state
    const link = page.locator('nav a').first();
    await link.hover();
    await expect(link).toHaveScreenshot('link-hover.png');
  });

  test('should match form input states', async ({ page }) => {
    await page.goto('/contact');
    
    const emailInput = page.locator('[data-testid="email-input"]');
    
    // Default state
    await expect(emailInput).toHaveScreenshot('input-default.png');
    
    // Focused state
    await emailInput.focus();
    await expect(emailInput).toHaveScreenshot('input-focused.png');
    
    // Filled state
    await emailInput.fill('test@example.com');
    await expect(emailInput).toHaveScreenshot('input-filled.png');
    
    // Error state
    await emailInput.fill('invalid-email');
    await emailInput.blur();
    await page.waitForTimeout(500); // Wait for validation
    await expect(emailInput).toHaveScreenshot('input-error.png');
  });

  test('should match loading states', async ({ page }) => {
    // Navigate to a page with loading state
    await page.goto('/products');
    
    // Capture loading spinner
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toHaveScreenshot('loading-spinner.png', {
      animations: 'disabled',
    });
  });

  test('should match modal dialogs', async ({ page }) => {
    // Open a modal
    await page.click('[data-testid="open-modal-button"]');
    await page.waitForSelector('[data-testid="modal-dialog"]');
    
    const modal = page.locator('[data-testid="modal-dialog"]');
    await expect(modal).toHaveScreenshot('modal-dialog.png');
    
    // Test with backdrop
    await expect(page).toHaveScreenshot('modal-with-backdrop.png');
  });

  test('should match dark mode theme', async ({ page, context }) => {
    // Enable dark mode
    await context.addCookies([
      { name: 'theme', value: 'dark', domain: 'localhost', path: '/' }
    ]);
    await page.reload();
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('homepage-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('should mask dynamic content', async ({ page }) => {
    // Mask dynamic content like timestamps, user data
    await expect(page).toHaveScreenshot('homepage-masked.png', {
      fullPage: true,
      mask: [
        page.locator('[data-testid="timestamp"]'),
        page.locator('[data-testid="user-avatar"]'),
        page.locator('[data-testid="dynamic-content"]'),
      ],
      maskColor: '#FF00FF',
    });
  });

  test('should handle animations correctly', async ({ page }) => {
    await page.goto('/animations');
    
    // Disable animations for consistent screenshots
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
    
    await expect(page).toHaveScreenshot('animations-disabled.png', {
      fullPage: true,
    });
  });

  test('should compare specific regions with different thresholds', async ({ page }) => {
    const criticalSection = page.locator('[data-testid="critical-section"]');
    const nonCriticalSection = page.locator('[data-testid="non-critical-section"]');
    
    // Strict comparison for critical UI
    await expect(criticalSection).toHaveScreenshot('critical-section.png', {
      maxDiffPixels: 0,
      threshold: 0,
    });
    
    // More lenient comparison for non-critical UI
    await expect(nonCriticalSection).toHaveScreenshot('non-critical-section.png', {
      maxDiffPixels: 100,
      threshold: 0.1,
    });
  });
});
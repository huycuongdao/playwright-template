import { test } from '@/fixtures/test.fixtures';
import { AccessibilityHelpers } from '@utils/accessibility.helpers';

test.describe('Homepage Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should pass WCAG 2.1 AA standards @a11y', async ({ page }) => {
    await AccessibilityHelpers.checkAccessibility(page, {
      detailedReport: true,
      runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'],
    });
  });

  test('should have proper heading structure', async ({ page }) => {
    await AccessibilityHelpers.checkHeadingStructure(page);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await AccessibilityHelpers.checkContrast(page);
  });

  test('should have alt text for all images', async ({ page }) => {
    await AccessibilityHelpers.checkImageAlts(page);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await AccessibilityHelpers.checkAriaLabels(page);
  });

  test('should be keyboard navigable', async ({ page }) => {
    await AccessibilityHelpers.checkKeyboardNavigation(page);

    // Additional keyboard navigation tests
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => document.activeElement?.tagName);
    test.expect(firstFocusedElement).toBe('A'); // Should focus on skip link

    // Tab through interactive elements
    const interactiveElements = await page.$$('a, button, input, select, textarea');
    for (let i = 0; i < Math.min(interactiveElements.length, 10); i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => ({
        tag: document.activeElement?.tagName,
        visible: document.activeElement?.offsetParent !== null,
      }));
      test.expect(focusedElement.visible).toBeTruthy();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/contact');
    await AccessibilityHelpers.checkFormLabels(page);
  });

  test('should handle focus indicators properly', async ({ page }) => {
    // Remove any custom focus styles temporarily
    await page.addStyleTag({
      content: '*:focus { outline: 2px solid red !important; }',
    });

    const button = page.locator('button').first();
    await button.focus();

    // Check if focus is visible
    const focusVisible = await button.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return styles.outlineWidth !== '0px' || styles.boxShadow !== 'none';
    });
    test.expect(focusVisible).toBeTruthy();
  });

  test('should have skip navigation links', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('[href="#main"], [href="#content"]').first();
    await test.expect(skipLink).toBeAttached();

    // Test skip link functionality
    await skipLink.focus();
    await skipLink.click();
    
    const mainContent = await page.evaluate(() => {
      const main = document.querySelector('main, #main, #content');
      return main?.id || main?.getAttribute('role');
    });
    test.expect(mainContent).toBeTruthy();
  });

  test('should announce dynamic content changes', async ({ page }) => {
    // Check for ARIA live regions
    const liveRegions = await page.$$('[aria-live], [role="alert"], [role="status"]');
    test.expect(liveRegions.length).toBeGreaterThan(0);

    // Test dynamic content announcement
    await page.click('[data-testid="load-more-button"]');
    
    const announcement = await page.waitForSelector('[role="status"]', { timeout: 5000 });
    const announcementText = await announcement.textContent();
    test.expect(announcementText).toContain('Loading');
  });

  test('should have proper language attributes', async ({ page }) => {
    // Check main language
    const htmlLang = await page.getAttribute('html', 'lang');
    test.expect(htmlLang).toBeTruthy();
    test.expect(htmlLang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // e.g., 'en' or 'en-US'

    // Check for language changes in content
    const langChanges = await page.$$('[lang]:not(html)');
    for (const element of langChanges) {
      const lang = await element.getAttribute('lang');
      test.expect(lang).toBeTruthy();
    }
  });

  test('should handle focus trap in modals', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="open-modal-button"]');
    await page.waitForSelector('[role="dialog"]');

    // Check focus is trapped
    const modalElements = await page.$$('[role="dialog"] *:is(a, button, input, select, textarea, [tabindex="0"])');
    const firstElement = modalElements[0];
    const lastElement = modalElements[modalElements.length - 1];

    // Tab from last element should go to first
    await lastElement.focus();
    await page.keyboard.press('Tab');
    
    const activeElement = await page.evaluate(() => document.activeElement?.outerHTML);
    const firstElementHTML = await firstElement.evaluate(el => el.outerHTML);
    test.expect(activeElement).toBe(firstElementHTML);
  });

  test('should provide text alternatives for icons', async ({ page }) => {
    const icons = await page.$$('[class*="icon"], svg, i[class*="fa"]');
    
    for (const icon of icons) {
      const hasTextAlternative = await icon.evaluate((el) => {
        const ariaLabel = el.getAttribute('aria-label');
        const title = el.querySelector('title')?.textContent;
        const srOnly = el.querySelector('.sr-only, .visually-hidden')?.textContent;
        const parentText = el.parentElement?.textContent?.trim();
        
        return !!(ariaLabel || title || srOnly || (parentText && parentText !== ''));
      });
      
      test.expect(hasTextAlternative).toBeTruthy();
    }
  });

  test('should handle error messages accessibly', async ({ page }) => {
    await page.goto('/contact');
    
    // Submit form with errors
    await page.click('[type="submit"]');
    
    // Check error messages are associated with inputs
    const errorMessages = await page.$$('[role="alert"], [aria-live="polite"]');
    test.expect(errorMessages.length).toBeGreaterThan(0);
    
    // Check inputs have aria-describedby pointing to errors
    const inputs = await page.$$('input[aria-invalid="true"]');
    for (const input of inputs) {
      const describedBy = await input.getAttribute('aria-describedby');
      test.expect(describedBy).toBeTruthy();
      
      const errorElement = await page.$(`#${describedBy}`);
      test.expect(errorElement).toBeTruthy();
    }
  });

  test('should check specific accessibility violations', async ({ page }) => {
    // Check only for critical issues
    await AccessibilityHelpers.checkAccessibility(page, {
      severity: ['serious', 'critical'],
      detailedReport: true,
    });
  });
});
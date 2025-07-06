# Visual Testing Guide

## Overview

Visual regression testing compares screenshots to detect unintended UI changes. This guide covers the complete workflow for visual testing in this project.

## ⚠️ Important: First Time Setup

**CRITICAL**: Before running visual tests for the first time, you must create baseline snapshots. Visual tests will fail without baselines to compare against.

## Complete Visual Testing Workflow

### 1. Create Initial Baselines (First Time Only)

```bash
# Create baselines for all visual tests
npm run test:visual:update

# Or for specific test files
npx playwright test tests/visual/login.visual.spec.ts --project=visual --update-snapshots
```

**What this does:**
- Takes screenshots of your current UI
- Stores them as "expected" baseline images
- Creates `.png` files in `tests/visual/[test-name].spec.ts-snapshots/` directory

### 2. Run Visual Tests (Normal Operation)

```bash
# Run all visual tests
npm run test:visual

# Run specific visual test file
npx playwright test tests/visual/login.visual.spec.ts --project=visual
```

**What this does:**
- Takes new screenshots
- Compares them against stored baselines
- Fails if differences exceed threshold
- Generates diff images showing changes

### 3. Handle Test Failures

When visual tests fail, you have two options:

#### A. View the Differences
```bash
# Open HTML report to see visual differences
npm run report

# Or view specific diff images in test-results/ folder
```

#### B. Update Baselines (If Changes Are Intentional)
```bash
# Update all baselines
npm run test:visual:update

# Update specific test baselines
npx playwright test tests/visual/login.visual.spec.ts --project=visual --update-snapshots
```

## Common Issues and Solutions

### 1. SSL Certificate Errors
**Problem**: `net::ERR_CERT_AUTHORITY_INVALID`

**Solution**: Set `ignoreHTTPSErrors: true` in visual project config:
```typescript
// playwright.config.ts
{
  name: 'visual',
  use: {
    ignoreHTTPSErrors: true, // Add this line
  },
}
```

### 2. Dynamic Content Causing Failures
**Problem**: CSRF tokens, timestamps, or other dynamic content changes between test runs

**Solution**: Use `mask` option to hide dynamic elements:
```typescript
await expect(page).toHaveScreenshot('login-page.png', {
  mask: [
    page.locator('input[name="_csrf"]'),
    page.locator('.timestamp'),
    page.locator('.session-id'),
  ],
});
```

### 3. Font Rendering Differences
**Problem**: Tests fail due to font rendering variations

**Solutions**:
- Use web fonts instead of system fonts
- Increase pixel difference threshold
- Wait for fonts to load before taking screenshots

### 4. Responsive Layout Issues
**Problem**: Tests fail on different viewport sizes

**Solution**: Explicitly set viewport in tests:
```typescript
test('mobile view', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/login');
  await expect(page).toHaveScreenshot('login-mobile.png');
});
```

## Best Practices

### 1. Test Organization
- Create separate test files for different features
- Use descriptive screenshot names
- Group related visual tests together

### 2. Baseline Management
- Store baselines in version control
- Create baselines on stable UI states
- Update baselines when UI changes are intentional

### 3. Test Stability
- Disable animations before taking screenshots
- Wait for page load states
- Mask dynamic content
- Use consistent test data

### 4. Threshold Configuration
Configure acceptable pixel differences in `playwright.config.ts`:
```typescript
expect: {
  toHaveScreenshot: {
    maxDiffPixels: 100,    // Max different pixels
    threshold: 0.2,        // 20% threshold
  },
}
```

## Example Test Structure

```typescript
// tests/visual/login.visual.spec.ts
test.describe('Login Page Visual Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login/auth');
    // Disable animations for consistency
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          transition-duration: 0s !important;
        }
      `,
    });
  });

  test('should match login page screenshot', async ({ page }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      mask: [
        page.locator('input[name="_csrf"]'),
      ],
    });
  });
});
```

## Troubleshooting Checklist

When visual tests fail:

1. **Check if baselines exist**: Look for `.png` files in `tests/visual/[test-name].spec.ts-snapshots/`
2. **View the diff**: Run `npm run report` to see visual differences
3. **Check for dynamic content**: Mask elements that change between runs
4. **Verify SSL settings**: Ensure `ignoreHTTPSErrors: true` for HTTPS sites
5. **Update baselines**: If changes are intentional, run `npm run test:visual:update`

## CI/CD Considerations

For continuous integration:
- Store baseline screenshots in version control
- Run visual tests after functional tests pass
- Consider using Docker for consistent rendering environments
- Set up automatic baseline updates for approved UI changes

## Files and Directories

- `tests/visual/`: Visual test files
- `tests/visual/[test-name].spec.ts-snapshots/`: Baseline screenshots
- `test-results/`: Test artifacts including diff images
- `playwright.config.ts`: Visual testing configuration
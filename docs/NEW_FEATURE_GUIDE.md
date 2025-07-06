# Comprehensive Guide: Adding Pages/Features to Test in Your Playwright Template

> 🔄 **Updated Guide**: This guide has been reviewed and enhanced with practical troubleshooting, correct import paths, project-specific conventions, and accessibility testing notes.

## 📋 Table of Contents

1. [Understanding the Current Architecture](#understanding-the-current-architecture)
2. [Prerequisites and Setup](#prerequisites-and-setup)
3. [Manual Approach - Step-by-Step Guide](#manual-approach---step-by-step-guide)
4. [Playwright MCP Approach - AI-Assisted Test Generation](#playwright-mcp-approach---ai-assisted-test-generation)
5. [Practical Example: Adding a Shopping Cart Feature](#practical-example-adding-a-shopping-cart-feature)
6. [Advanced Testing Patterns](#advanced-testing-patterns)
7. [Troubleshooting and Common Issues](#troubleshooting-and-common-issues)
8. [Best Practices and Tips](#best-practices-and-tips)

---

## Understanding the Current Architecture

Your Playwright template follows industry best practices with these key components:

### 🏗️ Project Structure
```
src/
├── pages/           # Page Object Model classes
├── fixtures/        # Custom test fixtures
├── utils/          # Helper utilities
├── config/         # Configuration files
└── types/          # TypeScript definitions

tests/
├── e2e/            # End-to-end tests
├── api/            # API tests
├── visual/         # Visual regression tests
├── accessibility/  # Accessibility tests
└── performance/    # Performance tests
```

### 📐 Architecture Patterns

1. **Page Object Model (POM)**: Each page extends `BasePage` with reusable methods
2. **Custom Fixtures**: Automatic page object injection into tests
3. **Multi-Environment Support**: Local, staging, production configurations
4. **Multiple Test Types**: E2E, API, visual, accessibility, performance
5. **Cross-Browser Testing**: Chrome, Firefox, Safari, mobile browsers

---

## Prerequisites and Setup

### ⚠️ Important Notes

**Accessibility Testing**: While accessibility tests are included in this guide for completeness, you can **skip implementing accessibility tests for now**. The template includes all the necessary setup, but focus on E2E, visual, and API tests first. You can always add accessibility testing later when needed.

### 🔧 Before You Start

1. **Ensure your application is running**: Your app should be accessible at the URL configured in your environment
2. **Check environment variables**: Make sure your `.env.local` file is properly configured
3. **Verify existing tests pass**: Run `npm test` to ensure the current setup works
4. **Understand your app's HTML structure**: Check if your app uses `data-testid` attributes or if you need to add them

### 📝 Test Data Considerations

- **API Endpoints**: Ensure test API endpoints are available in your test environment
- **Test Data**: Consider using the existing `DataGenerator` utility for dynamic test data
- **Database State**: Plan how to handle test data cleanup and setup
- **Authentication**: Decide if your feature requires authenticated or anonymous access

---

## Manual Approach - Step-by-Step Guide

### Step 1: Create the Page Object Class

**Location**: `src/pages/[feature-name].page.ts`

Create a new page object class that extends `BasePage`. Follow this template:

```typescript
// src/pages/shopping-cart.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class ShoppingCartPage extends BasePage {
  // Define all locators as readonly properties
  readonly cartIcon: Locator;
  readonly cartItems: Locator;
  readonly addToCartButton: Locator;
  readonly removeItemButton: Locator;
  readonly quantityInput: Locator;
  readonly totalPrice: Locator;
  readonly checkoutButton: Locator;
  readonly emptyCartMessage: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators using data-testid attributes (preferred)
    this.cartIcon = page.locator('[data-testid="cart-icon"]');
    this.cartItems = page.locator('[data-testid="cart-item"]');
    this.addToCartButton = page.locator('[data-testid="add-to-cart"]');
    this.removeItemButton = page.locator('[data-testid="remove-item"]');
    this.quantityInput = page.locator('[data-testid="quantity-input"]');
    this.totalPrice = page.locator('[data-testid="total-price"]');
    this.checkoutButton = page.locator('[data-testid="checkout-button"]');
    this.emptyCartMessage = page.locator('[data-testid="empty-cart-message"]');
  }

  // Define the page URL
  get url(): string {
    return '/cart';
  }

  // Page-specific methods
  async addItemToCart(productId: string): Promise<void> {
    await this.page.locator(`[data-product-id="${productId}"] [data-testid="add-to-cart"]`).click();
    await this.waitForElement(this.cartIcon);
  }

  async removeItemFromCart(productId: string): Promise<void> {
    await this.page.locator(`[data-product-id="${productId}"] [data-testid="remove-item"]`).click();
  }

  async updateQuantity(productId: string, quantity: number): Promise<void> {
    const quantityInput = this.page.locator(`[data-product-id="${productId}"] [data-testid="quantity-input"]`);
    await this.clearAndFill(quantityInput, quantity.toString());
  }

  async getCartItemCount(): Promise<number> {
    const count = await this.cartItems.count();
    return count;
  }

  async getTotalPrice(): Promise<string> {
    return this.getText(this.totalPrice);
  }

  async proceedToCheckout(): Promise<void> {
    await this.clickAndWait(this.checkoutButton);
  }

  async verifyCartIsEmpty(): Promise<void> {
    await this.expectToBeVisible(this.emptyCartMessage);
    await this.expectToHaveText(this.emptyCartMessage, 'Your cart is empty');
  }

  async verifyItemInCart(productName: string): Promise<void> {
    const cartItem = this.page.locator(`[data-testid="cart-item"]`).filter({ hasText: productName });
    await this.expectToBeVisible(cartItem);
  }
}
```

### Step 2: Update the Index File

**Location**: `src/pages/index.ts`

Add your new page object to the index file for easy imports:

```typescript
// src/pages/index.ts
export { BasePage } from './base.page';
export { HomePage } from './home.page';
export { LoginPage } from './login.page';
export { ProductsPage } from './products.page';
export { ShoppingCartPage } from './shopping-cart.page'; // Add this line
```

### Step 3: Update Test Fixtures

**Location**: `src/fixtures/test.fixtures.ts`

Add your page object to the fixtures system so it's automatically available in tests:

```typescript
// src/fixtures/test.fixtures.ts
import { test as base, Page } from '@playwright/test';
import { 
  HomePage, 
  LoginPage, 
  ProductsPage, 
  ShoppingCartPage  // Add import
} from '@pages';
import { testConfig } from '@/config/test.config';

type PageObjects = {
  homePage: HomePage;
  loginPage: LoginPage;
  productsPage: ProductsPage;
  shoppingCartPage: ShoppingCartPage;  // Add to type
};

type TestFixtures = {
  authenticatedPage: Page;
} & PageObjects;

export const test = base.extend<TestFixtures>({
  // Existing fixtures...
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

  // Add new fixture
  shoppingCartPage: async ({ page }, use) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    await use(shoppingCartPage);
  },

  // Update authenticated test fixtures too
  // ... rest of the file
});

// Also update authenticatedTest if needed
export const authenticatedTest = base.extend<TestFixtures>({
  // ... existing code

  // Add the same fixture here
  shoppingCartPage: async ({ page }, use) => {
    const shoppingCartPage = new ShoppingCartPage(page);
    await use(shoppingCartPage);
  },
});
```

### Step 4: Create E2E Tests

**Location**: `tests/e2e/shopping-cart.spec.ts`

Create comprehensive end-to-end tests for your feature:

```typescript
// tests/e2e/shopping-cart.spec.ts
import { test, expect } from '@fixtures/test.fixtures';
import { DataGenerator } from '@utils/data.generator';

test.describe('Shopping Cart Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to products page or home page
    await page.goto('/products');
  });

  test('should add item to cart @smoke', async ({ shoppingCartPage, productsPage }) => {
    // Arrange
    const productId = 'test-product-1';

    // Act
    await shoppingCartPage.addItemToCart(productId);
    await shoppingCartPage.navigate();

    // Assert
    await shoppingCartPage.verifyItemInCart('Test Product 1');
    const itemCount = await shoppingCartPage.getCartItemCount();
    expect(itemCount).toBe(1);
  });

  test('should remove item from cart', async ({ shoppingCartPage }) => {
    // Arrange - Add item first
    const productId = 'test-product-1';
    await shoppingCartPage.addItemToCart(productId);
    await shoppingCartPage.navigate();

    // Act
    await shoppingCartPage.removeItemFromCart(productId);

    // Assert
    await shoppingCartPage.verifyCartIsEmpty();
  });

  test('should update item quantity', async ({ shoppingCartPage }) => {
    // Arrange
    const productId = 'test-product-1';
    await shoppingCartPage.addItemToCart(productId);
    await shoppingCartPage.navigate();

    // Act
    await shoppingCartPage.updateQuantity(productId, 3);

    // Assert
    const quantityInput = shoppingCartPage.page.locator(`[data-product-id="${productId}"] [data-testid="quantity-input"]`);
    await expect(quantityInput).toHaveValue('3');
  });

  test('should calculate total price correctly @regression', async ({ shoppingCartPage }) => {
    // Arrange
    const products = ['test-product-1', 'test-product-2'];
    
    // Act
    for (const productId of products) {
      await shoppingCartPage.addItemToCart(productId);
    }
    await shoppingCartPage.navigate();

    // Assert
    const total = await shoppingCartPage.getTotalPrice();
    expect(total).toMatch(/\$\d+\.\d{2}/); // Matches currency format
  });

  test('should proceed to checkout', async ({ shoppingCartPage, page }) => {
    // Arrange
    await shoppingCartPage.addItemToCart('test-product-1');
    await shoppingCartPage.navigate();

    // Act
    await shoppingCartPage.proceedToCheckout();

    // Assert
    await expect(page).toHaveURL('/checkout');
  });

  test('should persist cart items across page navigation', async ({ shoppingCartPage, page }) => {
    // Arrange
    await shoppingCartPage.addItemToCart('test-product-1');
    
    // Act
    await page.goto('/');
    await shoppingCartPage.navigate();

    // Assert
    const itemCount = await shoppingCartPage.getCartItemCount();
    expect(itemCount).toBe(1);
  });
});

test.describe('Shopping Cart Edge Cases', () => {
  test('should handle empty cart state', async ({ shoppingCartPage }) => {
    // Act
    await shoppingCartPage.navigate();

    // Assert
    await shoppingCartPage.verifyCartIsEmpty();
    await expect(shoppingCartPage.checkoutButton).toBeDisabled();
  });

  test('should handle maximum quantity limits', async ({ shoppingCartPage }) => {
    // Arrange
    const productId = 'test-product-1';
    await shoppingCartPage.addItemToCart(productId);
    await shoppingCartPage.navigate();

    // Act
    await shoppingCartPage.updateQuantity(productId, 999);

    // Assert
    const quantityInput = shoppingCartPage.page.locator(`[data-product-id="${productId}"] [data-testid="quantity-input"]`);
    await expect(quantityInput).toHaveAttribute('max', '10'); // Assuming max limit is 10
  });
});
```

### Step 5: Create Visual Regression Tests

**Location**: `tests/visual/shopping-cart.visual.spec.ts`

```typescript
// tests/visual/shopping-cart.visual.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Visual Tests', () => {
  test('should match empty cart screenshot', async ({ page }) => {
    await page.goto('/cart');
    
    await expect(page).toHaveScreenshot('empty-cart.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match cart with items screenshot', async ({ page }) => {
    // Add some test items
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/cart');
    
    await expect(page).toHaveScreenshot('cart-with-items.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('should match mobile cart view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto('/cart');
    
    await expect(page).toHaveScreenshot('mobile-cart.png', {
      fullPage: true
    });
  });
});
```

### Step 6: Create Accessibility Tests (Optional - Skip for Now)

> ⚠️ **Note**: You can skip accessibility tests for now and focus on E2E, visual, and API tests first. This section is included for reference when you're ready to add comprehensive accessibility testing.

**Location**: `tests/accessibility/shopping-cart.a11y.spec.ts`

```typescript
// tests/accessibility/shopping-cart.a11y.spec.ts
import { test } from '@playwright/test';
import { AccessibilityHelpers } from '@utils/accessibility.helpers';

test.describe('Shopping Cart Accessibility', () => {
  test('should pass WCAG 2.1 AA standards for empty cart', async ({ page }) => {
    await page.goto('/cart');
    
    await AccessibilityHelpers.checkAccessibility(page, {
      runOnly: ['wcag2a', 'wcag2aa'],
      detailedReport: true
    });
  });

  test('should pass WCAG 2.1 AA standards for cart with items', async ({ page }) => {
    // Add items to cart first
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/cart');
    
    await AccessibilityHelpers.checkAccessibility(page, {
      runOnly: ['wcag2a', 'wcag2aa']
    });
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.goto('/cart');
    await AccessibilityHelpers.checkKeyboardNavigation(page);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/products');
    await page.locator('[data-testid="add-to-cart"]').first().click();
    await page.goto('/cart');
    
    await AccessibilityHelpers.checkFormLabels(page);
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/cart');
    await AccessibilityHelpers.checkAriaLabels(page);
  });
});
```

### Step 7: Create API Tests (if applicable)

**Location**: `tests/api/cart.api.spec.ts`

```typescript
// tests/api/cart.api.spec.ts
import { test, expect } from '@playwright/test';
import { APIHelpers } from '@utils/api.helpers';

test.describe('Shopping Cart API', () => {
  let api: APIHelpers;

  test.beforeEach(async ({ request }) => {
    api = new APIHelpers(request, process.env.API_BASE_URL || 'https://api.example.com');
  });

  test('should add item to cart via API', async () => {
    const response = await api.post('/cart/items', {
      data: {
        productId: 'test-product-1',
        quantity: 1
      }
    });

    expect(response.status()).toBe(201);
    const responseBody = await response.json();
    expect(responseBody).toHaveProperty('cartId');
    expect(responseBody.items).toHaveLength(1);
  });

  test('should get cart contents', async () => {
    // First add an item
    await api.post('/cart/items', {
      data: { productId: 'test-product-1', quantity: 1 }
    });

    const response = await api.get('/cart');
    
    expect(response.status()).toBe(200);
    const cart = await response.json();
    expect(cart.items).toHaveLength(1);
    expect(cart.total).toBeGreaterThan(0);
  });

  test('should remove item from cart via API', async () => {
    // First add an item
    const addResponse = await api.post('/cart/items', {
      data: { productId: 'test-product-1', quantity: 1 }
    });
    const cartData = await addResponse.json();
    const itemId = cartData.items[0].id;

    // Remove the item
    const response = await api.delete(`/cart/items/${itemId}`);
    
    expect(response.status()).toBe(204);
  });

  test('should update item quantity via API', async () => {
    // First add an item
    const addResponse = await api.post('/cart/items', {
      data: { productId: 'test-product-1', quantity: 1 }
    });
    const cartData = await addResponse.json();
    const itemId = cartData.items[0].id;

    // Update quantity
    const response = await api.patch(`/cart/items/${itemId}`, {
      data: { quantity: 3 }
    });

    expect(response.status()).toBe(200);
    const updatedItem = await response.json();
    expect(updatedItem.quantity).toBe(3);
  });
});
```

### Step 8: Create Performance Tests

**Location**: `tests/performance/shopping-cart.perf.spec.ts`

```typescript
// tests/performance/shopping-cart.perf.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Shopping Cart Performance', () => {
  test('should load cart page within performance budget', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/cart');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should add items to cart efficiently', async ({ page }) => {
    await page.goto('/products');
    
    const startTime = Date.now();
    
    // Add multiple items quickly
    for (let i = 0; i < 5; i++) {
      await page.locator('[data-testid="add-to-cart"]').nth(i).click();
      await page.waitForTimeout(100); // Small delay to simulate real usage
    }
    
    const totalTime = Date.now() - startTime;
    expect(totalTime).toBeLessThan(2000); // Should complete within 2 seconds
  });

  test('should measure Core Web Vitals for cart page', async ({ page }) => {
    await page.goto('/cart');
    
    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach((entry) => {
            if (entry.name === 'largest-contentful-paint') {
              vitals['LCP'] = entry.value;
            }
            if (entry.name === 'first-input-delay') {
              vitals['FID'] = entry.value;
            }
            if (entry.name === 'cumulative-layout-shift') {
              vitals['CLS'] = entry.value;
            }
          });
          
          resolve(vitals);
        }).observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
        
        // Fallback timeout
        setTimeout(() => resolve({}), 5000);
      });
    });

    // Assert Core Web Vitals thresholds
    if (vitals['LCP']) expect(vitals['LCP']).toBeLessThan(2500); // Good LCP
    if (vitals['FID']) expect(vitals['FID']).toBeLessThan(100);  // Good FID
    if (vitals['CLS']) expect(vitals['CLS']).toBeLessThan(0.1);  // Good CLS
  });
});
```

---

## Playwright MCP Approach - AI-Assisted Test Generation

Playwright MCP (Model Context Protocol) allows you to use AI to explore your application and automatically generate tests. Here's how to set it up and use it:

### MCP Setup Instructions

#### Step 1: Configure VS Code

Create a `.vscode/mcp.json` file in your project root:

```json
{
    "servers": {
        "playwright": {
            "command": "npx",
            "args": ["@playwright/mcp@latest"]
        }
    }
}
```

#### Step 2: Create Test Generation Prompt

Create `.github/generate_tests.prompt.md`:

```markdown
# Playwright Test Generation Prompt

You are a Playwright test generator expert. Your task is to explore web applications and generate comprehensive test suites.

## Guidelines:

1. **Exploration First**: Always explore the page/feature thoroughly before writing tests
2. **Use Page Object Model**: Follow the existing POM pattern in this project
3. **Multiple Test Types**: Generate E2E, visual, accessibility, and API tests when applicable
4. **Use Proper Locators**: Prefer data-testid attributes, then role-based locators
5. **Follow Project Structure**: Maintain consistency with existing code patterns
6. **Include Edge Cases**: Test both happy path and error scenarios
7. **Add Appropriate Tags**: Use @smoke, @regression, @critical tags
8. **Comprehensive Assertions**: Verify both UI state and business logic

## Process:

1. Navigate to the target page/feature
2. Explore all interactive elements
3. Identify user workflows and edge cases
4. Generate page object classes following existing patterns
5. Create comprehensive test suites
6. Include visual regression tests
7. Add accessibility checks
8. Generate API tests for backend interactions

## Code Standards:

- Use TypeScript
- Follow existing naming conventions
- Include proper error handling
- Add meaningful test descriptions
- Use the project's custom fixtures
- Maintain consistency with existing test structure

Generate tests that are production-ready and maintainable.
```

#### Step 3: Configure VS Code Settings

Create/update `.vscode/settings.json`:

```json
{
    "chat.tools.autoApprove": true,
    "mcp.enableAgent": true
}
```

### Using Playwright MCP for Test Generation

#### Basic Usage Commands

1. **Explore a Feature**:
   ```
   Explore https://your-app.com/cart and generate comprehensive tests
   ```

2. **Generate Specific Test Types**:
   ```
   Generate accessibility tests for the shopping cart feature at https://your-app.com/cart
   ```

3. **Create Page Objects**:
   ```
   Create a page object model for the checkout process at https://your-app.com/checkout
   ```

4. **Generate API Tests**:
   ```
   Explore the cart API endpoints and generate API tests
   ```

#### Advanced MCP Workflows

1. **Complete Feature Testing**:
   ```
   I need comprehensive test coverage for a new shopping cart feature. 
   
   Please:
   1. Explore the cart functionality at https://your-app.com/cart
   2. Generate a page object class following our existing pattern
   3. Create E2E tests covering add/remove/update cart operations
   4. Generate visual regression tests
   5. Create accessibility tests
   6. Generate API tests for cart operations
   7. Update the fixtures file to include the new page object
   
   Make sure to follow our project structure and conventions.
   ```

2. **Cross-Browser Testing**:
   ```
   Generate cross-browser tests for the shopping cart that work with our existing playwright.config.ts setup for Chrome, Firefox, and Safari
   ```

3. **Mobile Testing**:
   ```
   Create mobile-specific tests for the cart feature, testing both iPhone and Android viewports
   ```

#### MCP Integration with Existing Template

When using MCP, ensure the generated code integrates with your existing template:

1. **Update Fixtures**: Add generated page objects to `src/fixtures/test.fixtures.ts`
2. **Follow Naming Conventions**: Ensure generated files follow your project's naming patterns
3. **Maintain Directory Structure**: Place generated files in appropriate directories
4. **Review and Refactor**: Always review AI-generated code for consistency and best practices

#### Example MCP Conversation

```
User: Explore https://myapp.com/cart and generate comprehensive tests

MCP Response:
🤖 I'll explore the shopping cart functionality and generate comprehensive tests. Let me start by navigating to the page and analyzing the elements.

[MCP explores the page, identifies elements, user workflows]

Based on my exploration, I found:
- Add to cart functionality
- Quantity update controls  
- Remove item buttons
- Total price calculation
- Checkout process

I'll now generate:
1. ShoppingCartPage class
2. E2E test suite
3. Visual regression tests
4. Accessibility tests
5. Updated fixtures

[Generates code following your project patterns]
```

### MCP Best Practices

1. **Start with Exploration**: Always let MCP explore before generating tests
2. **Provide Context**: Include information about your project structure and conventions
3. **Review Generated Code**: AI-generated code should be reviewed for quality and consistency
4. **Iterative Approach**: Generate tests in phases (page objects first, then tests)
5. **Customize Prompts**: Tailor prompts to your specific needs and coding standards

---

## Practical Example: Adding a Shopping Cart Feature

Let's walk through a complete example of adding a shopping cart feature using both manual and MCP approaches:

### Manual Implementation

Following the steps above, we would:

1. ✅ Create `src/pages/shopping-cart.page.ts`
2. ✅ Update `src/pages/index.ts`
3. ✅ Update `src/fixtures/test.fixtures.ts`
4. ✅ Create `tests/e2e/shopping-cart.spec.ts`
5. ✅ Create `tests/visual/shopping-cart.visual.spec.ts`
6. ✅ Create `tests/accessibility/shopping-cart.a11y.spec.ts`
7. ✅ Create `tests/api/cart.api.spec.ts`
8. ✅ Create `tests/performance/shopping-cart.perf.spec.ts`

### MCP Implementation

Using MCP, you would:

```
1. Open VS Code with the MCP configuration
2. Use the command: "Explore https://myapp.com/cart and generate comprehensive test suite following our existing patterns"
3. Review and integrate the generated code
4. Run tests to verify functionality
```

The MCP approach would generate similar files but with potentially better coverage based on actual page exploration.

---

## Advanced Testing Patterns

### Environment-Specific Testing

Update your tests to work across different environments:

```typescript
// In your test files
const baseUrl = process.env.BASE_URL || 'https://localhost:3000';
const isProduction = process.env.TEST_ENV === 'production';

test.describe('Shopping Cart - Environment Specific', () => {
  test.skip(isProduction, 'Skip in production');
  
  test('should handle test data in staging', async ({ shoppingCartPage }) => {
    // Test with staging-specific data
  });
});
```

### Cross-Browser Testing

Ensure your tests work across all configured browsers:

```typescript
// tests/cross-browser/shopping-cart.spec.ts
import { test, expect, devices } from '@playwright/test';

for (const browserName of ['chromium', 'firefox', 'webkit']) {
  test.describe(`Shopping Cart - ${browserName}`, () => {
    test.use({ ...devices['Desktop Chrome'] });
    
    test(`should work correctly in ${browserName}`, async ({ page }) => {
      // Browser-specific tests
    });
  });
}
```

### Data-Driven Testing

Use the DataGenerator utility for comprehensive testing:

```typescript
import { DataGenerator } from '@utils/data.generator';

test.describe('Shopping Cart - Data Driven', () => {
  const testCases = [
    { quantity: 1, expectedTotal: 19.99 },
    { quantity: 5, expectedTotal: 99.95 },
    { quantity: 10, expectedTotal: 199.90 }
  ];

  for (const testCase of testCases) {
    test(`should calculate total correctly for quantity ${testCase.quantity}`, async ({ shoppingCartPage }) => {
      // Use testCase data
    });
  }
});
```

### Parallel Testing

Configure parallel execution in your npm scripts:

```json
{
  "scripts": {
    "test:cart": "playwright test tests/**/shopping-cart*.spec.ts",
    "test:cart:parallel": "playwright test tests/**/shopping-cart*.spec.ts --workers=4"
  }
}
```

---

## Troubleshooting and Common Issues

### 🐛 Common Problems and Solutions

#### Import Path Issues
```typescript
// ❌ Wrong - will cause module not found errors
import { test } from '@/fixtures/test.fixtures.ts';

// ✅ Correct - matches tsconfig.json paths
import { test } from '@fixtures/test.fixtures';
import { HomePage } from '@pages';
import { DataGenerator } from '@utils/data.generator';
```

#### Page Object Not Available in Tests
```typescript
// ❌ Wrong - page object not in fixtures
test('should work', async ({ page }) => {
  const cartPage = new ShoppingCartPage(page); // Manual instantiation
});

// ✅ Correct - using fixtures
test('should work', async ({ shoppingCartPage }) => {
  await shoppingCartPage.navigate(); // Available via fixtures
});
```

#### Locator Not Found Issues
```typescript
// ❌ Fragile - might break with UI changes
this.cartIcon = page.locator('.cart-icon');

// ✅ Robust - using data-testid
this.cartIcon = page.locator('[data-testid="cart-icon"]');

// ✅ Alternative - role-based locator
this.cartIcon = page.getByRole('button', { name: 'Cart' });
```

#### Environment Variable Issues
```bash
# Add to your .env.local file
BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:3000/api
TEST_USERNAME=test@example.com
TEST_PASSWORD=testpassword123
```

#### Test Data Cleanup
```typescript
// Add to your test setup
test.beforeEach(async ({ page }) => {
  // Clear any existing cart data
  await page.evaluate(() => {
    localStorage.removeItem('cart');
    sessionStorage.clear();
  });
});

test.afterEach(async ({ page }) => {
  // Cleanup after each test
  await page.evaluate(() => {
    localStorage.clear();
  });
});
```

#### Docker Integration Issues

If your tests need to run in Docker, update the Docker command to include your new tests:

```bash
# Run specific feature tests in Docker
./scripts/docker-run.sh all local

# Or run just your new cart tests
docker run --rm \
  -e BASE_URL="http://host.docker.internal:3000" \
  -v "$(pwd)/reports:/app/reports" \
  playwright-tests \
  npx playwright test tests/**/shopping-cart*.spec.ts
```

#### Visual Test Screenshot Issues

```typescript
// ❌ Might be flaky due to animations
await expect(page).toHaveScreenshot('cart.png');

// ✅ Better - disable animations
await expect(page).toHaveScreenshot('cart.png', {
  animations: 'disabled',
  clip: { x: 0, y: 0, width: 800, height: 600 } // Consistent viewport
});
```

#### TypeScript Compilation Errors

```bash
# Check for TypeScript errors
npm run typecheck

# Common fixes:
# 1. Make sure all imports have correct paths
# 2. Check that your page object extends BasePage
# 3. Ensure all methods return proper types
```

### 🔧 Integration with Existing CI/CD

Your new tests will automatically be included in the existing GitHub Actions workflows. If you want feature-specific CI runs:

```yaml
# Add to .github/workflows/playwright.yml
- name: Run feature tests
  if: contains(github.event.pull_request.changed_files, 'src/pages/shopping-cart.page.ts')
  run: npx playwright test tests/**/shopping-cart*.spec.ts
```

### 📊 Test Reports Integration

Your new tests will appear in all existing reports:
- **HTML Report**: Available at `reports/html-report/index.html`
- **Allure Report**: Run `npm run allure:serve` after tests
- **JSON Report**: Available at `reports/results.json`

---

## Best Practices and Tips

### 🎯 Locator Strategy (Following Project Standards)

1. **Primary: data-testid attributes**: `[data-testid="cart-icon"]`
   ```typescript
   // Best practice in this project
   this.cartIcon = page.locator('[data-testid="cart-icon"]');
   ```

2. **Secondary: Role-based locators**: `page.getByRole('button', { name: 'Add to Cart' })`
   ```typescript
   // Good alternative when data-testid isn't available
   this.submitButton = page.getByRole('button', { name: 'Submit' });
   ```

3. **Avoid: Generic CSS selectors**: Unless absolutely necessary
   ```typescript
   // ❌ Avoid - too fragile
   this.button = page.locator('.btn');
   
   // ✅ Better
   this.button = page.locator('[data-testid="submit-button"]');
   ```

4. **Make locators specific and unique**: Avoid selectors that could match multiple elements
   ```typescript
   // ❌ Too generic
   this.cartItem = page.locator('.item');
   
   // ✅ Specific
   this.cartItem = page.locator('[data-testid="cart-item"]');
   ```

### 📝 Test Organization (Following Project Conventions)

1. **Group related tests**: Use `test.describe()` blocks consistently
   ```typescript
   test.describe('Shopping Cart - Core Functionality', () => {
     // Happy path tests
   });
   
   test.describe('Shopping Cart - Edge Cases', () => {
     // Error scenarios and edge cases
   });
   ```

2. **Use meaningful, descriptive test names**:
   ```typescript
   // ❌ Vague
   test('cart test', async () => {});
   
   // ✅ Descriptive
   test('should add item to cart and update total price', async () => {});
   ```

3. **Add appropriate tags following project standards**:
   - `@smoke`: Critical functionality that must work
   - `@regression`: Comprehensive tests for release validation
   - `@critical`: Must-pass tests for production deployment
   ```typescript
   test('should complete checkout process @smoke @critical', async () => {});
   ```

4. **Keep tests independent**: Each test should be able to run alone
   ```typescript
   test.beforeEach(async ({ page }) => {
     // Reset state for each test
     await page.goto('/cart');
     await page.evaluate(() => localStorage.clear());
   });
   ```

### 🔧 Maintenance Tips

1. **Regular reviews**: Review and update tests as features evolve
2. **Remove flaky tests**: Fix or remove tests that fail intermittently
3. **Update locators**: Keep locators in sync with UI changes
4. **Monitor test performance**: Keep test execution times reasonable

### 🚀 CI/CD Integration

Your tests will automatically run in CI/CD with the existing GitHub Actions setup. Add feature-specific test runs:

```yaml
# .github/workflows/feature-tests.yml
name: Feature Tests
on:
  pull_request:
    paths:
      - 'src/pages/shopping-cart.page.ts'
      - 'tests/**/shopping-cart*.spec.ts'

jobs:
  test-shopping-cart:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install
      - name: Run shopping cart tests
        run: npm run test:cart
```

### 📊 Reporting and Monitoring

Your template includes comprehensive reporting. For feature-specific reports:

```bash
# Run only shopping cart tests with detailed reporting
npx playwright test tests/**/shopping-cart*.spec.ts --reporter=html,json

# Generate Allure report for cart tests
USE_ALLURE=true npx playwright test tests/**/shopping-cart*.spec.ts
npm run allure:serve
```

---

## Quick Reference Commands

```bash
# Development Commands
npm run test:ui                    # Run tests in UI mode
npm run test:debug                 # Debug specific tests
npm run codegen                    # Generate test code
npm run validate                   # Run TypeScript check, lint, and format check

# Feature-Specific Testing
npx playwright test tests/**/shopping-cart*.spec.ts  # Run cart tests only
npm run test:smoke -- --grep "cart"                  # Run cart smoke tests
npm run test:visual -- tests/visual/shopping-cart*   # Run cart visual tests
npm run test:a11y -- tests/accessibility/shopping-cart* # Run accessibility tests (when ready)

# Cross-Browser Testing (Using project configurations)
npm run test:chrome -- tests/**/shopping-cart*       # Chrome only
npm run test:firefox -- tests/**/shopping-cart*      # Firefox only
npm run test:webkit -- tests/**/shopping-cart*       # Safari/WebKit only
npm run test:mobile -- tests/**/shopping-cart*       # Mobile browsers

# Environment Testing
npm run test:local -- tests/**/shopping-cart*        # Local environment
npm run test:staging -- tests/**/shopping-cart*      # Staging environment
TEST_ENV=production npm test tests/**/shopping-cart*  # Production environment

# Docker Testing
./scripts/docker-run.sh all local                    # All tests in Docker
./scripts/docker-run.sh smoke staging                # Smoke tests in staging

# Reporting and Analysis
npm run report                     # View HTML report
npm run allure:serve              # View Allure report
npm run clean:reports             # Clean all report directories

# Code Quality
npm run lint                       # Check code style
npm run lint:fix                  # Fix linting issues
npm run format                     # Format code with Prettier
npm run typecheck                 # TypeScript compilation check
```

---

## Summary

This guide provides two complementary approaches for adding pages/features to your Playwright template:

1. **Manual Approach**: Full control, follows established patterns, great for learning
2. **MCP Approach**: AI-assisted, faster initial generation, good for exploration

**Recommended Workflow**:
1. Use MCP for initial exploration and code generation
2. Review and refactor generated code to match your standards
3. Add manual refinements and edge cases
4. Integrate with your existing CI/CD pipeline
5. Monitor and maintain tests over time

Both approaches ensure your tests are maintainable, comprehensive, and follow industry best practices while integrating seamlessly with your existing Playwright template.
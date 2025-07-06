import { test, expect } from '@/fixtures/test.fixtures';
import { DataGenerator } from '@utils/data.generator';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials @smoke', async ({ loginPage, page }) => {
    // Arrange
    const validUser = {
      username: 'testuser@example.com',
      password: 'Test123!@#',
    };

    // Act
    await loginPage.login(validUser.username, validUser.password);

    // Assert
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="welcome-message"]')).toContainText('Welcome');
  });

  test('should show error message with invalid credentials', async ({ loginPage }) => {
    // Arrange
    const invalidUser = {
      username: DataGenerator.generateEmail(),
      password: 'wrongpassword',
    };

    // Act
    await loginPage.login(invalidUser.username, invalidUser.password);

    // Assert
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toHaveText('Invalid username or password');
  });

  test('should validate required fields', async ({ loginPage }) => {
    // Act - Click login without filling fields
    await loginPage.loginButton.click();

    // Assert
    await expect(loginPage.usernameInput).toHaveAttribute('aria-invalid', 'true');
    await expect(loginPage.passwordInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('should navigate to forgot password page', async ({ loginPage, page }) => {
    // Act
    await loginPage.goToForgotPassword();

    // Assert
    await expect(page).toHaveURL('/forgot-password');
    await expect(page.locator('h1')).toHaveText('Reset Your Password');
  });

  test('should remember user when checkbox is checked', async ({ loginPage, page, context }) => {
    // Arrange
    const user = {
      username: 'remember@example.com',
      password: 'Test123!@#',
    };

    // Act
    await loginPage.login(user.username, user.password, true);

    // Get cookies
    const cookies = await context.cookies();
    const rememberCookie = cookies.find(cookie => cookie.name === 'remember_token');

    // Assert
    expect(rememberCookie).toBeDefined();
    expect(rememberCookie?.expires).toBeGreaterThan(Date.now() / 1000 + 86400); // More than 1 day
  });

  test('should handle login with Enter key', async ({ loginPage, page }) => {
    // Arrange
    const user = {
      username: 'testuser@example.com',
      password: 'Test123!@#',
    };

    // Act
    await loginPage.loginWithEnter(user.username, user.password);

    // Assert
    await expect(page).toHaveURL('/dashboard');
  });

  test('should display password in plain text when show password is clicked', async ({ loginPage, page }) => {
    // Arrange
    const password = 'MySecretPassword123';
    await loginPage.fillField(loginPage.passwordInput, password);

    // Act
    const showPasswordButton = page.locator('[data-testid="show-password-button"]');
    await showPasswordButton.click();

    // Assert
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
    await expect(loginPage.passwordInput).toHaveValue(password);
  });

  test('should handle session timeout @regression', async ({ loginPage, page, context }) => {
    // Arrange - Login first
    await loginPage.login('testuser@example.com', 'Test123!@#');
    await expect(page).toHaveURL('/dashboard');

    // Act - Clear session
    await context.clearCookies();
    await page.reload();

    // Assert - Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.locator('[data-testid="session-expired-message"]')).toBeVisible();
  });
});
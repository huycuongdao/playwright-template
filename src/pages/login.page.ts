import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signupLink: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-testid="username-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.forgotPasswordLink = page.locator('[data-testid="forgot-password-link"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me-checkbox"]');
    this.signupLink = page.locator('[data-testid="signup-link"]');
  }

  get url(): string {
    return '/login';
  }

  async login(username: string, password: string, rememberMe = false): Promise<void> {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    
    if (rememberMe) {
      await this.checkCheckbox(this.rememberMeCheckbox);
    }
    
    await this.loginButton.click();
  }

  async loginWithEnter(username: string, password: string): Promise<void> {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.passwordInput.press('Enter');
  }

  async getErrorMessage(): Promise<string> {
    await this.waitForElement(this.errorMessage);
    return this.getText(this.errorMessage);
  }

  async isErrorMessageVisible(): Promise<boolean> {
    return this.isVisible(this.errorMessage);
  }

  async goToForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async goToSignup(): Promise<void> {
    await this.signupLink.click();
  }

  async verifyLoginPageElements(): Promise<void> {
    await this.expectToBeVisible(this.usernameInput);
    await this.expectToBeVisible(this.passwordInput);
    await this.expectToBeVisible(this.loginButton);
    await this.expectToBeVisible(this.forgotPasswordLink);
    await this.expectToBeVisible(this.rememberMeCheckbox);
  }
}
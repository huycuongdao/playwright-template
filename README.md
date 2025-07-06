# Playwright Test Template

A comprehensive, production-ready Playwright testing framework template with TypeScript, featuring best practices, multiple testing types, CI/CD integration, and Docker support.

## ✨ Features

- 🚀 **TypeScript Support** - Full TypeScript configuration with strict typing
- 🎭 **Page Object Model** - Maintainable test structure with page objects
- 🔧 **Multi-Environment Support** - Local, staging, and production configurations
- 📊 **Multiple Reporting Options** - HTML, JSON, JUnit, Allure, and custom reports
- 🐳 **Docker Support** - Containerized test execution
- 🔄 **CI/CD Ready** - GitHub Actions workflows for automated testing
- 🎨 **Visual Regression Testing** - Screenshot comparison and visual testing
- ♿ **Accessibility Testing** - Built-in a11y testing with axe-core
- ⚡ **Performance Testing** - Core Web Vitals and performance monitoring
- 🛠 **Code Quality** - ESLint, Prettier, and pre-commit hooks
- 🔀 **Cross-Browser Testing** - Chrome, Firefox, Safari, and mobile browsers
- 🧪 **API Testing** - REST API testing capabilities
- 📱 **Mobile Testing** - Mobile browser testing support

## 📁 Project Structure

```
playwright-template/
├── src/
│   ├── config/           # Configuration files
│   ├── fixtures/         # Custom test fixtures
│   ├── pages/            # Page Object Model classes
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions and helpers
├── tests/
│   ├── e2e/              # End-to-end tests
│   ├── api/              # API tests
│   ├── visual/           # Visual regression tests
│   ├── accessibility/    # Accessibility tests
│   └── performance/      # Performance tests
├── reports/              # Test reports
├── test-results/         # Test artifacts
├── .github/workflows/    # GitHub Actions
├── scripts/              # Helper scripts
└── docker-compose.yml    # Docker orchestration
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm 8+
- Git

### Installation

1. **Clone or fork this repository**
   ```bash
   git clone https://github.com/your-username/playwright-template.git
   cd playwright-template
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Playwright browsers**
   ```bash
   npx playwright install
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Run your first test**
   ```bash
   npm test
   ```

## 🔧 Configuration

### Environment Variables

Create environment-specific files:

- `.env.local` - Local development
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

```bash
# Base configuration
BASE_URL=https://example.com
API_BASE_URL=https://api.example.com

# Authentication
API_TOKEN=your_api_token_here
TEST_USERNAME=testuser@example.com
TEST_PASSWORD=testpassword

# Test configuration
TEST_ENV=local
HEADLESS=false
SLOW_MO=0
```

### Playwright Configuration

The main configuration is in `playwright.config.ts`:

- **Multiple browsers**: Chrome, Firefox, Safari, Edge
- **Mobile testing**: iPhone, Android devices
- **API testing**: Dedicated API project
- **Visual testing**: Screenshot comparison
- **Accessibility testing**: axe-core integration

## 🧪 Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests with UI mode
npm run test:ui

# Run tests in debug mode
npm run test:debug

# Run specific browser tests
npm run test:chrome
npm run test:firefox
npm run test:webkit

# Run mobile tests
npm run test:mobile

# Run specific test types
npm run test:api
npm run test:visual
npm run test:a11y
npm run test:smoke
npm run test:regression

# Run tests for specific environment
npm run test:local
npm run test:staging
```

### Advanced Usage

```bash
# Run tests with specific grep pattern
npx playwright test --grep "login"

# Run tests in headed mode
npm run test:headed

# Run with trace for debugging
npx playwright test --trace on

# Generate test code
npm run codegen
```

## 📊 Test Reports

### HTML Reports

```bash
# View the last test report
npm run report

# Generate and view report
npx playwright show-report
```

### Allure Reports

```bash
# Run tests with Allure reporter
npm run test:allure

# Generate Allure report
npm run allure:generate

# Serve Allure report
npm run allure:serve
```

### Custom Reports

Custom reporting is available in `src/utils/reporter.ts` with:
- JSON reports
- Markdown summaries
- Slack/Teams notifications
- Email notifications

## 🐳 Docker Support

### Build and Run

```bash
# Build Docker image
docker build -t playwright-tests .

# Run tests in Docker
./scripts/docker-run.sh all local

# Run specific test types
./scripts/docker-run.sh smoke staging
./scripts/docker-run.sh api production
```

### Docker Compose

```bash
# Run all test services
docker-compose up

# Run specific services
docker-compose up playwright-smoke
docker-compose up playwright-api

# Run with reporting services
docker-compose --profile reporting up
```

## 🔄 CI/CD Integration

### GitHub Actions

The repository includes several workflow files:

- `.github/workflows/playwright.yml` - Main test workflow
- `.github/workflows/cross-browser.yml` - Cross-browser testing
- `.github/workflows/smoke-tests.yml` - Deployment smoke tests

### Environment Secrets

Configure these secrets in your GitHub repository:

```
STAGING_URL
API_STAGING_URL
PRODUCTION_URL
API_PRODUCTION_URL
API_TOKEN
SLACK_WEBHOOK_URL
```

## 📝 Writing Tests

### Page Object Model

```typescript
// src/pages/login.page.ts
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.locator('[data-testid="username"]');
    this.passwordInput = page.locator('[data-testid="password"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
  }

  async login(username: string, password: string): Promise<void> {
    await this.fillField(this.usernameInput, username);
    await this.fillField(this.passwordInput, password);
    await this.loginButton.click();
  }
}
```

### Test Example

```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@/fixtures/test.fixtures';

test.describe('Login Tests', () => {
  test('should login successfully @smoke', async ({ loginPage }) => {
    await loginPage.navigate();
    await loginPage.login('user@example.com', 'password');
    await expect(page).toHaveURL('/dashboard');
  });
});
```

### API Testing

```typescript
// tests/api/users.api.spec.ts
import { test, expect } from '@playwright/test';
import { APIHelpers } from '@utils/api.helpers';

test('should create user', async ({ request }) => {
  const api = new APIHelpers(request, 'https://api.example.com');
  const response = await api.post('/users', {
    data: { name: 'John Doe', email: 'john@example.com' }
  });
  
  expect(response.status()).toBe(201);
});
```

## 🎨 Visual Testing

```typescript
// tests/visual/homepage.visual.spec.ts
test('should match homepage screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png', {
    fullPage: true,
    animations: 'disabled'
  });
});
```

## ♿ Accessibility Testing

```typescript
// tests/accessibility/homepage.a11y.spec.ts
import { AccessibilityHelpers } from '@utils/accessibility.helpers';

test('should pass accessibility standards', async ({ page }) => {
  await page.goto('/');
  await AccessibilityHelpers.checkAccessibility(page, {
    runOnly: ['wcag2a', 'wcag2aa']
  });
});
```

## 🔧 Code Quality

### Linting and Formatting

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check

# Type checking
npm run typecheck

# Run all quality checks
npm run validate
```

### Pre-commit Hooks

The template includes validation in the `prepare` script that runs:
- TypeScript compilation check
- ESLint validation
- Prettier formatting check

## 📋 Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Add tags (@smoke, @regression) for test categorization
- Keep tests independent and atomic

### Page Objects

- Create reusable page objects for UI interactions
- Use meaningful locators (data-testid preferred)
- Implement wait strategies in page objects
- Follow the DRY principle

### Test Data

- Use faker.js for generating dynamic test data
- Store static test data in separate files
- Use environment variables for configuration
- Avoid hardcoding sensitive data

### Error Handling

- Implement proper wait strategies
- Use soft assertions when appropriate
- Add retry logic for flaky operations
- Capture screenshots on failures

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📚 Extending This Template

### Adding New Pages/Features

This template includes comprehensive guides for adding new pages and features:

- **📖 [Complete Guide](docs/NEW_FEATURE_GUIDE.md)**: Step-by-step instructions for adding new pages/features
- **⚡ [Quick Prompt](docs/QUICK_PROMPT.md)**: Copy-paste prompt template for manual implementation
- **🤖 [MCP Prompt](docs/MCP_PROMPT.md)**: AI-assisted exploration and test generation
- **🔧 [Detailed Prompt](docs/ADD_NEW_FEATURE_PROMPT.md)**: Full prompt template with examples and inputs

### Usage:

**Manual Approach:**
1. Copy the prompt from `docs/QUICK_PROMPT.md`
2. Fill in your feature details
3. Run the prompt to generate all necessary files

**AI-Assisted Approach:**
1. Set up MCP configuration (one-time setup in `docs/MCP_PROMPT.md`)
2. Copy the MCP exploration prompt
3. Provide your application URL and let AI explore and generate tests

**Both approaches:**
4. Follow the troubleshooting guide if needed

The guides cover:
- **Manual Implementation**: Step-by-step page object and test creation
- **AI-Assisted Generation**: MCP setup and automated exploration
- **Permission Testing**: Role-based testing for admin vs normal user scenarios
- Page Object Model creation and test fixtures integration
- E2E, Visual, API, and Permission test generation
- Project convention alignment and troubleshooting

## 🆘 Support

- 📚 [Playwright Documentation](https://playwright.dev/)
- 💬 [GitHub Issues](https://github.com/your-username/playwright-template/issues)
- 📧 Email: your-email@example.com

## 🙏 Acknowledgments

- [Playwright Team](https://github.com/microsoft/playwright) for the amazing testing framework
- [TypeScript](https://www.typescriptlang.org/) for type safety
- [Faker.js](https://fakerjs.dev/) for test data generation
- [Axe-core](https://github.com/dequelabs/axe-core) for accessibility testing

---

**Happy Testing! 🎭**
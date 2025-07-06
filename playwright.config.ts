import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';
import CustomReporter, { setupAllureEnvironment } from './src/utils/reporter';

// Load environment variables based on the environment
const environment = process.env.TEST_ENV || 'local';
dotenv.config({ path: path.resolve(__dirname, `.env.${environment}`) });
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Determine which reporters to use
const reporters: any[] = [
  ['list'],
  ['html', { outputFolder: 'reports/html-report', open: 'never' }],
  ['json', { outputFile: 'reports/results.json' }],
  ['junit', { outputFile: 'reports/junit.xml' }],
  ['./src/utils/reporter.ts'], // Custom reporter
];

// Add environment-specific reporters
if (process.env.CI) {
  reporters.push(['github']);
} else {
  reporters.push(['line']);
}

// Add Allure reporter if requested
if (process.env.USE_ALLURE === 'true') {
  reporters.push(['allure-playwright', {
    outputFolder: 'allure-results',
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false,
  }]);
}

const config = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 4 : undefined,
  reporter: reporters,
  
  use: {
    baseURL: process.env.BASE_URL || 'https://playwright.dev',
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: process.env.CI ? 'retain-on-failure' : 'on',
    actionTimeout: 30000,
    navigationTimeout: 30000,
    
    // Custom test attributes
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    
    // Viewport
    viewport: { width: 1280, height: 720 },
    
    // Geolocation, permissions, locale
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // HTTP headers
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  projects: [
    // Desktop browsers
    {
      name: 'chrome',
      use: { 
        ...devices['Desktop Chrome'], 
        channel: 'chrome' 
      },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    
    // API testing project
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: process.env.API_BASE_URL || 'https://api.example.com',
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${process.env.API_TOKEN || ''}`,
        },
      },
    },
    
    // Visual regression testing
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Visual testing specific settings
        ignoreHTTPSErrors: true,
      },
    },
    
    // Accessibility testing
    {
      name: 'a11y',
      testMatch: /.*\.a11y\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  // Test timeout
  timeout: process.env.CI ? 60000 : 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
  },

  // Output folder for test artifacts
  outputDir: 'test-results/',

  // Run your local dev server before starting the tests
  webServer: process.env.USE_WEB_SERVER === 'true' ? {
    command: process.env.WEB_SERVER_COMMAND || 'npm run dev',
    url: process.env.WEB_SERVER_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  } : undefined,
});

// Setup Allure environment info if Allure is enabled
if (process.env.USE_ALLURE === 'true') {
  setupAllureEnvironment(config);
}

export default config;
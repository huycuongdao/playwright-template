export interface TestConfig {
  baseURL: string;
  apiBaseURL: string;
  credentials: {
    username: string;
    password: string;
  };
  environment: string;
  headless: boolean;
  slowMo: number;
  apiToken: string;
}

export const testConfig: TestConfig = {
  baseURL: process.env.BASE_URL || 'https://playwright.dev',
  apiBaseURL: process.env.API_BASE_URL || 'https://api.example.com',
  credentials: {
    username: process.env.TEST_USERNAME || 'testuser@example.com',
    password: process.env.TEST_PASSWORD || 'testpassword',
  },
  environment: process.env.TEST_ENV || 'local',
  headless: process.env.HEADLESS === 'true',
  slowMo: parseInt(process.env.SLOW_MO || '0', 10),
  apiToken: process.env.API_TOKEN || '',
};
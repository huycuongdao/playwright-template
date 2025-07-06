export interface ReportingConfig {
  // Report Portal configuration
  reportPortal?: {
    enabled: boolean;
    token: string;
    endpoint: string;
    project: string;
    launch: string;
    description?: string;
    attributes?: Array<{ key?: string; value: string }>;
  };

  // Slack notification configuration
  slack?: {
    enabled: boolean;
    webhookUrl: string;
    channel?: string;
    onlyOnFailure?: boolean;
  };

  // Email notification configuration
  email?: {
    enabled: boolean;
    smtp: {
      host: string;
      port: number;
      secure: boolean;
      auth: {
        user: string;
        pass: string;
      };
    };
    from: string;
    to: string[];
    onlyOnFailure?: boolean;
  };

  // Teams notification configuration
  teams?: {
    enabled: boolean;
    webhookUrl: string;
    onlyOnFailure?: boolean;
  };

  // GitHub status updates
  github?: {
    enabled: boolean;
    token: string;
    owner: string;
    repo: string;
  };
}

export const reportingConfig: ReportingConfig = {
  reportPortal: {
    enabled: process.env.REPORT_PORTAL_ENABLED === 'true',
    token: process.env.REPORT_PORTAL_TOKEN || '',
    endpoint: process.env.REPORT_PORTAL_ENDPOINT || '',
    project: process.env.REPORT_PORTAL_PROJECT || 'playwright-tests',
    launch: process.env.REPORT_PORTAL_LAUNCH || 'Test Run',
    description: process.env.REPORT_PORTAL_DESCRIPTION || 'Automated test execution',
    attributes: [
      { key: 'environment', value: process.env.TEST_ENV || 'local' },
      { key: 'browser', value: 'chromium' },
      { value: 'playwright' },
    ],
  },

  slack: {
    enabled: process.env.SLACK_ENABLED === 'true',
    webhookUrl: process.env.SLACK_WEBHOOK_URL || '',
    channel: process.env.SLACK_CHANNEL || '#test-results',
    onlyOnFailure: process.env.SLACK_ONLY_ON_FAILURE !== 'false',
  },

  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    },
    from: process.env.EMAIL_FROM || '',
    to: (process.env.EMAIL_TO || '').split(',').filter(Boolean),
    onlyOnFailure: process.env.EMAIL_ONLY_ON_FAILURE !== 'false',
  },

  teams: {
    enabled: process.env.TEAMS_ENABLED === 'true',
    webhookUrl: process.env.TEAMS_WEBHOOK_URL || '',
    onlyOnFailure: process.env.TEAMS_ONLY_ON_FAILURE !== 'false',
  },

  github: {
    enabled: process.env.GITHUB_ENABLED === 'true',
    token: process.env.GITHUB_TOKEN || '',
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
  },
};

// Notification helpers
export class NotificationHelpers {
  static async sendSlackNotification(
    webhookUrl: string,
    testResults: any,
    config: ReportingConfig['slack']
  ): Promise<void> {
    if (!config?.enabled || !webhookUrl) return;

    const { passed, failed, skipped, totalTests } = testResults;
    const status = failed > 0 ? 'failed' : 'passed';
    
    if (config.onlyOnFailure && status === 'passed') return;

    const message = {
      channel: config.channel,
      username: 'Playwright Bot',
      icon_emoji: status === 'passed' ? ':white_check_mark:' : ':x:',
      attachments: [{
        color: status === 'passed' ? 'good' : 'danger',
        title: `Test Run ${status === 'passed' ? 'Passed' : 'Failed'}`,
        fields: [
          { title: 'Total Tests', value: totalTests.toString(), short: true },
          { title: 'Passed', value: passed.toString(), short: true },
          { title: 'Failed', value: failed.toString(), short: true },
          { title: 'Skipped', value: skipped.toString(), short: true },
          { title: 'Environment', value: process.env.TEST_ENV || 'local', short: true },
          { title: 'Duration', value: `${(testResults.duration / 1000).toFixed(2)}s`, short: true },
        ],
        footer: 'Playwright Test Results',
        ts: Math.floor(Date.now() / 1000),
      }],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Slack notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
    }
  }

  static async sendTeamsNotification(
    webhookUrl: string,
    testResults: any,
    config: ReportingConfig['teams']
  ): Promise<void> {
    if (!config?.enabled || !webhookUrl) return;

    const { passed, failed, skipped, totalTests } = testResults;
    const status = failed > 0 ? 'failed' : 'passed';
    
    if (config.onlyOnFailure && status === 'passed') return;

    const message = {
      '@type': 'MessageCard',
      '@context': 'http://schema.org/extensions',
      themeColor: status === 'passed' ? '00FF00' : 'FF0000',
      summary: `Test Run ${status === 'passed' ? 'Passed' : 'Failed'}`,
      sections: [{
        activityTitle: `Playwright Test Results - ${status.toUpperCase()}`,
        activitySubtitle: `Environment: ${process.env.TEST_ENV || 'local'}`,
        facts: [
          { name: 'Total Tests', value: totalTests.toString() },
          { name: 'Passed', value: passed.toString() },
          { name: 'Failed', value: failed.toString() },
          { name: 'Skipped', value: skipped.toString() },
          { name: 'Duration', value: `${(testResults.duration / 1000).toFixed(2)}s` },
        ],
        markdown: true,
      }],
    };

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        throw new Error(`Teams notification failed: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to send Teams notification:', error);
    }
  }

  static async sendEmailNotification(
    testResults: any,
    config: ReportingConfig['email']
  ): Promise<void> {
    if (!config?.enabled) return;

    const { passed, failed, skipped, totalTests } = testResults;
    const status = failed > 0 ? 'failed' : 'passed';
    
    if (config.onlyOnFailure && status === 'passed') return;

    // This would require nodemailer or similar email library
    console.log('Email notification would be sent here:', {
      status,
      testResults,
      config,
    });
  }
}
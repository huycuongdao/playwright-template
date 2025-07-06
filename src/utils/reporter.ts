import { Reporter, TestCase, TestResult, TestStep, FullConfig, Suite } from '@playwright/test/reporter';
import fs from 'fs';
import path from 'path';

export default class CustomReporter implements Reporter {
  private results: any[] = [];
  private startTime!: Date;
  private config!: FullConfig;

  onBegin(config: FullConfig, suite: Suite) {
    this.config = config;
    this.startTime = new Date();
    console.log(`Starting test run with ${suite.allTests().length} tests`);
  }

  onTestBegin(test: TestCase, result: TestResult) {
    console.log(`Running test: ${test.title}`);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep) {
    if (step.category === 'test.step') {
      console.log(`  Step: ${step.title}`);
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep) {
    if (step.error) {
      console.error(`  Step failed: ${step.title}`);
      console.error(`  Error: ${step.error.message}`);
    }
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status;
    const duration = result.duration;
    
    const testResult = {
      title: test.title,
      fullTitle: test.titlePath().join(' > '),
      file: test.location.file,
      line: test.location.line,
      column: test.location.column,
      status,
      duration,
      retry: result.retry,
      error: result.error?.message,
      stack: result.error?.stack,
      stdout: result.stdout,
      stderr: result.stderr,
      attachments: result.attachments.map(a => ({
        name: a.name,
        path: a.path,
        contentType: a.contentType,
      })),
      tags: test.tags,
      annotations: test.annotations,
    };

    this.results.push(testResult);

    const statusIcon = {
      passed: '✅',
      failed: '❌',
      timedOut: '⏱️',
      skipped: '⏭️',
      interrupted: '🛑',
    }[status] || '❓';

    console.log(`${statusIcon} ${test.title} (${duration}ms)`);
    
    if (result.error) {
      console.error(`   ${result.error.message}`);
    }
  }

  async onEnd(result: { status?: 'passed' | 'failed' | 'timedout' | 'interrupted' }) {
    const endTime = new Date();
    const duration = endTime.getTime() - this.startTime.getTime();

    const summary = {
      startTime: this.startTime.toISOString(),
      endTime: endTime.toISOString(),
      duration,
      status: result.status,
      totalTests: this.results.length,
      passed: this.results.filter(r => r.status === 'passed').length,
      failed: this.results.filter(r => r.status === 'failed').length,
      skipped: this.results.filter(r => r.status === 'skipped').length,
      flaky: this.results.filter(r => r.retry > 0 && r.status === 'passed').length,
      results: this.results,
    };

    // Write detailed JSON report
    const reportPath = path.join(this.config.rootDir, 'reports', 'custom-report.json');
    await fs.promises.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.promises.writeFile(reportPath, JSON.stringify(summary, null, 2));

    // Write summary markdown
    const summaryPath = path.join(this.config.rootDir, 'reports', 'summary.md');
    const summaryMd = this.generateMarkdownSummary(summary);
    await fs.promises.writeFile(summaryPath, summaryMd);

    // Console summary
    console.log('\n' + '='.repeat(50));
    console.log('Test Run Summary');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${summary.totalTests}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏭️  Skipped: ${summary.skipped}`);
    console.log(`🔄 Flaky: ${summary.flaky}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(50));

    if (summary.failed > 0) {
      console.log('\nFailed Tests:');
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          console.log(`  ❌ ${r.fullTitle}`);
          console.log(`     ${r.error}`);
          console.log(`     at ${r.file}:${r.line}`);
        });
    }
  }

  private generateMarkdownSummary(summary: any): string {
    let md = '# Test Run Report\n\n';
    md += `**Date**: ${new Date(summary.startTime).toLocaleString()}\n`;
    md += `**Duration**: ${(summary.duration / 1000).toFixed(2)}s\n`;
    md += `**Status**: ${summary.status || 'completed'}\n\n`;

    md += '## Summary\n\n';
    md += '| Status | Count | Percentage |\n';
    md += '|--------|-------|------------|\n';
    md += `| ✅ Passed | ${summary.passed} | ${((summary.passed / summary.totalTests) * 100).toFixed(1)}% |\n`;
    md += `| ❌ Failed | ${summary.failed} | ${((summary.failed / summary.totalTests) * 100).toFixed(1)}% |\n`;
    md += `| ⏭️ Skipped | ${summary.skipped} | ${((summary.skipped / summary.totalTests) * 100).toFixed(1)}% |\n`;
    md += `| 🔄 Flaky | ${summary.flaky} | ${((summary.flaky / summary.totalTests) * 100).toFixed(1)}% |\n`;

    if (summary.failed > 0) {
      md += '\n## Failed Tests\n\n';
      this.results
        .filter(r => r.status === 'failed')
        .forEach(r => {
          md += `### ❌ ${r.title}\n`;
          md += `- **File**: ${r.file}:${r.line}\n`;
          md += `- **Error**: ${r.error}\n`;
          if (r.tags.length > 0) {
            md += `- **Tags**: ${r.tags.join(', ')}\n`;
          }
          md += '\n';
        });
    }

    md += '\n## Test Details\n\n';
    md += '<details>\n<summary>Click to expand full test results</summary>\n\n';
    md += '| Test | Status | Duration | Tags |\n';
    md += '|------|--------|----------|------|\n';
    
    this.results.forEach(r => {
      const statusIcon = {
        passed: '✅',
        failed: '❌',
        timedOut: '⏱️',
        skipped: '⏭️',
      }[r.status] || '❓';
      
      md += `| ${r.title} | ${statusIcon} | ${r.duration}ms | ${r.tags.join(', ') || '-'} |\n`;
    });
    
    md += '\n</details>\n';

    return md;
  }
}

// Allure reporter helper
export function setupAllureEnvironment(config: any) {
  const environmentInfo = {
    framework: 'Playwright',
    frameworkVersion: require('@playwright/test/package.json').version,
    os: process.platform,
    node: process.version,
    testEnvironment: process.env.TEST_ENV || 'local',
    baseUrl: process.env.BASE_URL || config.use?.baseURL,
    timestamp: new Date().toISOString(),
  };

  const allureResultsPath = process.env.ALLURE_RESULTS_DIR || 'allure-results';
  const envPath = path.join(allureResultsPath, 'environment.properties');

  const envContent = Object.entries(environmentInfo)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  try {
    fs.mkdirSync(allureResultsPath, { recursive: true });
    fs.writeFileSync(envPath, envContent);
  } catch (error) {
    console.error('Failed to write Allure environment info:', error);
  }
}
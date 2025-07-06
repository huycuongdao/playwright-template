import { Page, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export interface AxeViolation {
  id: string;
  impact?: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

export class AccessibilityHelpers {
  static async checkAccessibility(
    page: Page,
    options?: {
      detailedReport?: boolean;
      includeRules?: string[];
      excludeRules?: string[];
      runOnly?: string[];
      severity?: ('minor' | 'moderate' | 'serious' | 'critical')[];
    }
  ): Promise<void> {
    const builder = new AxeBuilder({ page });

    if (options?.includeRules) {
      builder.include(options.includeRules);
    }

    if (options?.excludeRules) {
      builder.exclude(options.excludeRules);
    }

    if (options?.runOnly) {
      builder.withTags(options.runOnly);
    }

    const results = await builder.analyze();

    let violations = results.violations;

    // Filter by severity if specified
    if (options?.severity) {
      violations = violations.filter(
        (violation) => violation.impact && options.severity?.includes(violation.impact)
      );
    }

    if (violations.length > 0) {
      if (options?.detailedReport) {
        console.log('\n=== Accessibility Violations Found ===\n');
        violations.forEach((violation) => {
          console.log(`Rule: ${violation.id}`);
          console.log(`Impact: ${violation.impact}`);
          console.log(`Description: ${violation.description}`);
          console.log(`Help: ${violation.help}`);
          console.log(`Help URL: ${violation.helpUrl}`);
          console.log('Affected elements:');
          violation.nodes.forEach((node) => {
            console.log(`  - ${node.target.join(', ')}`);
            console.log(`    HTML: ${node.html}`);
          });
          console.log('\n');
        });
      }

      const violationSummary = violations
        .map((v) => `${v.id} (${v.impact}): ${v.description}`)
        .join('\n');

      throw new Error(
        `Found ${violations.length} accessibility violations:\n${violationSummary}`
      );
    }
  }

  static async checkContrast(page: Page, selector?: string): Promise<void> {
    const builder = new AxeBuilder({ page });
    
    if (selector) {
      builder.include(selector);
    }

    const results = await builder
      .withTags(['wcag2aa', 'wcag2aaa'])
      .disableRules(['color-contrast-enhanced'])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.id === 'color-contrast'
    );

    if (contrastViolations.length > 0) {
      throw new Error(
        `Found ${contrastViolations[0].nodes.length} color contrast violations`
      );
    }
  }

  static async checkKeyboardNavigation(page: Page): Promise<void> {
    // Check if all interactive elements are keyboard accessible
    const interactiveElements = await page.$$eval(
      'a, button, input, select, textarea, [tabindex]',
      (elements) =>
        elements.map((el) => ({
          tag: el.tagName.toLowerCase(),
          tabindex: el.getAttribute('tabindex'),
          disabled: el.hasAttribute('disabled'),
          href: el.getAttribute('href'),
          text: el.textContent?.trim() || '',
        }))
    );

    const inaccessibleElements = interactiveElements.filter(
      (el) => el.tabindex === '-1' && !el.disabled
    );

    if (inaccessibleElements.length > 0) {
      throw new Error(
        `Found ${inaccessibleElements.length} keyboard inaccessible elements`
      );
    }
  }

  static async checkAriaLabels(page: Page): Promise<void> {
    const builder = new AxeBuilder({ page });
    const results = await builder
      .withRules([
        'aria-allowed-attr',
        'aria-required-attr',
        'aria-valid-attr',
        'aria-valid-attr-value',
        'aria-label',
        'aria-labelledby',
        'aria-describedby',
      ])
      .analyze();

    if (results.violations.length > 0) {
      throw new Error(
        `Found ${results.violations.length} ARIA label violations`
      );
    }
  }

  static async checkHeadingStructure(page: Page): Promise<void> {
    const headings = await page.$$eval(
      'h1, h2, h3, h4, h5, h6',
      (elements) =>
        elements.map((el) => ({
          level: parseInt(el.tagName.charAt(1)),
          text: el.textContent?.trim() || '',
        }))
    );

    // Check for multiple h1s
    const h1Count = headings.filter((h) => h.level === 1).length;
    if (h1Count > 1) {
      throw new Error(`Found ${h1Count} h1 elements. There should be only one.`);
    }

    // Check for skipped heading levels
    const levels = headings.map((h) => h.level).sort((a, b) => a - b);
    for (let i = 1; i < levels.length; i++) {
      if (levels[i] - levels[i - 1] > 1) {
        throw new Error(
          `Heading structure broken: h${levels[i - 1]} followed by h${levels[i]}`
        );
      }
    }
  }

  static async checkImageAlts(page: Page): Promise<void> {
    const images = await page.$$eval('img', (elements) =>
      elements.map((el) => ({
        src: el.getAttribute('src') || '',
        alt: el.getAttribute('alt'),
        decorative: el.getAttribute('role') === 'presentation',
      }))
    );

    const missingAlts = images.filter(
      (img) => img.alt === null && !img.decorative
    );

    if (missingAlts.length > 0) {
      throw new Error(
        `Found ${missingAlts.length} images without alt text`
      );
    }
  }

  static async checkFormLabels(page: Page): Promise<void> {
    const formElements = await page.$$eval(
      'input:not([type="hidden"]), select, textarea',
      (elements) =>
        elements.map((el) => {
          const id = el.getAttribute('id');
          const ariaLabel = el.getAttribute('aria-label');
          const ariaLabelledby = el.getAttribute('aria-labelledby');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          
          return {
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type') || 'text',
            hasLabel: !!(label || ariaLabel || ariaLabelledby),
            id,
          };
        })
    );

    const unlabeledElements = formElements.filter((el) => !el.hasLabel);

    if (unlabeledElements.length > 0) {
      throw new Error(
        `Found ${unlabeledElements.length} form elements without labels`
      );
    }
  }

  static async generateAccessibilityReport(
    page: Page,
    reportPath: string
  ): Promise<void> {
    const builder = new AxeBuilder({ page });
    const results = await builder.analyze();

    const report = {
      url: page.url(),
      timestamp: new Date().toISOString(),
      violations: results.violations,
      passes: results.passes.length,
      incomplete: results.incomplete.length,
      inapplicable: results.inapplicable.length,
    };

    await page.context().storageState({ path: reportPath });
  }
}
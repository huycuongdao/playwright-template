import { test, expect } from '@playwright/test';

test.describe('Homepage Performance Tests', () => {
  test('should load within performance budget @performance', async ({ page }) => {
    // Start collecting metrics
    await page.goto('/', { waitUntil: 'networkidle' });

    // Get performance metrics
    const performanceTiming = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        // Time to First Byte
        ttfb: timing.responseStart - timing.navigationStart,
        // DOM Content Loaded
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        // Load Complete
        loadComplete: timing.loadEventEnd - timing.navigationStart,
      };
    });

    // Performance budgets
    expect(performanceTiming.ttfb).toBeLessThan(600); // 600ms
    expect(performanceTiming.domContentLoaded).toBeLessThan(1500); // 1.5s
    expect(performanceTiming.loadComplete).toBeLessThan(3000); // 3s
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');

    // Collect Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        let lcp = 0;
        let fid = 0;
        let cls = 0;
        let fcp = 0;

        // Observe LCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Observe FID (simulated)
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-input') {
              fid = entry.processingStart - entry.startTime;
            }
          });
        }).observe({ entryTypes: ['first-input'] });

        // Observe CLS
        let clsValue = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          cls = clsValue;
        }).observe({ entryTypes: ['layout-shift'] });

        // Observe FCP
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            fcp = fcpEntry.startTime;
          }
        }).observe({ entryTypes: ['paint'] });

        // Wait for metrics to be collected
        setTimeout(() => {
          resolve({ lcp, fid, cls, fcp });
        }, 5000);
      });
    });

    // Core Web Vitals thresholds
    expect(metrics.lcp).toBeLessThan(2500); // 2.5s - Good LCP
    expect(metrics.fid).toBeLessThan(100); // 100ms - Good FID
    expect(metrics.cls).toBeLessThan(0.1); // 0.1 - Good CLS
    expect(metrics.fcp).toBeLessThan(1800); // 1.8s - Good FCP
  });

  test('should have optimized resource loading', async ({ page }) => {
    const resourceTimings: any[] = [];

    // Collect resource timings
    page.on('response', async (response) => {
      const timing = await response.timing();
      resourceTimings.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        duration: timing.responseEnd,
      });
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Check for oversized resources
    const oversizedResources = resourceTimings.filter(
      (resource) => parseInt(resource.size) > 500000 // 500KB
    );
    expect(oversizedResources.length).toBe(0);

    // Check for slow resources
    const slowResources = resourceTimings.filter(
      (resource) => resource.duration > 1000 // 1 second
    );
    expect(slowResources.length).toBeLessThan(3);

    // Check for failed resources
    const failedResources = resourceTimings.filter(
      (resource) => resource.status >= 400
    );
    expect(failedResources.length).toBe(0);
  });

  test('should have efficient JavaScript execution', async ({ page }) => {
    await page.goto('/');

    const jsMetrics = await page.evaluate(() => {
      const entries = performance.getEntriesByType('measure');
      const scripts = performance.getEntriesByType('resource')
        .filter((entry: any) => entry.initiatorType === 'script');

      return {
        scriptCount: scripts.length,
        totalScriptSize: scripts.reduce((total: number, script: any) => 
          total + (script.transferSize || 0), 0
        ),
        totalScriptDuration: scripts.reduce((total: number, script: any) => 
          total + script.duration, 0
        ),
        longTasks: performance.getEntriesByType('longtask' as any).length,
      };
    });

    // JavaScript performance budgets
    expect(jsMetrics.scriptCount).toBeLessThan(20); // Max 20 scripts
    expect(jsMetrics.totalScriptSize).toBeLessThan(1000000); // 1MB total
    expect(jsMetrics.totalScriptDuration).toBeLessThan(2000); // 2s total
    expect(jsMetrics.longTasks).toBeLessThan(3); // Max 3 long tasks
  });

  test('should handle memory efficiently', async ({ page }) => {
    await page.goto('/');

    // Monitor memory usage
    const initialMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Perform some interactions
    for (let i = 0; i < 5; i++) {
      await page.click('[data-testid="interactive-button"]');
      await page.waitForTimeout(500);
    }

    const finalMemory = await page.evaluate(() => {
      return (performance as any).memory?.usedJSHeapSize || 0;
    });

    // Check for memory leaks (should not grow excessively)
    const memoryGrowth = finalMemory - initialMemory;
    expect(memoryGrowth).toBeLessThan(10000000); // 10MB max growth
  });

  test('should have optimized images', async ({ page }) => {
    const images: any[] = [];

    page.on('response', async (response) => {
      if (response.request().resourceType() === 'image') {
        images.push({
          url: response.url(),
          status: response.status(),
          size: parseInt(response.headers()['content-length'] || '0'),
          type: response.headers()['content-type'],
        });
      }
    });

    await page.goto('/', { waitUntil: 'networkidle' });

    // Check image optimization
    for (const image of images) {
      // Images should be reasonably sized
      expect(image.size).toBeLessThan(1000000); // 1MB max

      // Images should use modern formats
      const modernFormats = ['image/webp', 'image/avif', 'image/jpeg', 'image/png'];
      expect(modernFormats).toContain(image.type);
    }

    // Check for lazy loading
    const lazyImages = await page.$$('img[loading="lazy"]');
    const totalImages = await page.$$('img');
    const lazyLoadingRatio = lazyImages.length / totalImages.length;
    expect(lazyLoadingRatio).toBeGreaterThan(0.5); // At least 50% lazy loaded
  });

  test('should cache resources effectively', async ({ page }) => {
    // First visit
    await page.goto('/');
    
    // Collect cached resources on second visit
    const cachedResources: string[] = [];
    page.on('response', (response) => {
      if (response.fromCache()) {
        cachedResources.push(response.url());
      }
    });

    // Second visit
    await page.reload();

    // Check cache effectiveness
    expect(cachedResources.length).toBeGreaterThan(5); // At least 5 cached resources
  });

  test('should minimize layout shifts', async ({ page }) => {
    await page.goto('/');

    // Monitor layout shifts during interaction
    const layoutShifts = await page.evaluate(() => {
      const shifts: any[] = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            shifts.push({
              value: (entry as any).value,
              sources: (entry as any).sources?.length || 0,
            });
          }
        }
      }).observe({ entryTypes: ['layout-shift'] });

      return new Promise((resolve) => {
        // Scroll and interact
        window.scrollTo(0, document.body.scrollHeight);
        setTimeout(() => {
          window.scrollTo(0, 0);
          setTimeout(() => resolve(shifts), 1000);
        }, 1000);
      });
    });

    // Check cumulative layout shift
    const totalCLS = (layoutShifts as any[]).reduce((sum, shift) => sum + shift.value, 0);
    expect(totalCLS).toBeLessThan(0.1); // Good CLS threshold
  });
});
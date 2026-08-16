import { defineConfig } from '@playwright/test';

const isListMode = process.argv.includes('--list');

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  retries: 0,
  reporter: isListMode
    ? [['list']]
    : [
        ['list'],
        // Simple report: compact dashboard table with expandable rows
        [
          'playwright-runner-lm-reporter',
          {
            outputDir: 'playwright-lm-report',
            reportTitle: 'Simple Automation Report',
            reportSubtitle: 'playwright-runner-lm-reporter simple demo',
            defaultEnvironment: 'local',
            defaultAuthor: 'Example QA',
            liveRefreshSeconds: 0,
            theme: 'light',
          },
        ],
      ],
  use: {
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
});

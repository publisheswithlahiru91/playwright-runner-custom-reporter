# playwright-runner-lm-reporter

Real-time HTML reporter for [Playwright](https://playwright.dev/) test runs. Available in two modes:

- **Simple** — compact dashboard table with stats, filters, expandable rows, and run history
- **Advanced** — Playwright-inspired drill-down UI with nested `test.step()` trees, trace download, and hash-based test selection

Originally built for IFS assyst UI automation and packaged for reuse across Playwright projects.

## Installation

```bash
npm install --save-dev playwright-runner-lm-reporter @playwright/test
```

## Reporter modes

### Simple report

Best for CI summaries, quick scanning, and lightweight HTML output.

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['playwright-runner-lm-reporter'],
  ],
  use: {
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
});
```

**Simple features**

- Real-time console progress and live HTML refresh (disabled automatically in CI)
- Stats dashboard with pass rate and duration
- Status and suite filters (Passed, Failed, Skipped, Smoke, Regression, Functional)
- Expandable table rows with nested steps, screenshots, video, and trace download
- Timestamped reports, stable `index.html` / `latest.html`, and `history.html`

### Advanced report

Best when you want Playwright HTML report-style drill-down and nested steps.

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['list'],
    ['playwright-runner-lm-reporter/advanced'],
  ],
  use: {
    trace: 'on',
    screenshot: 'on',
    video: 'on',
  },
});
```

**Advanced features**

- Split-view layout: searchable test list on the left, scenario detail on the right
- Hash routing — share a direct link like `#?testId=test-abc123`
- Eye-catching stat tiles with filters on the right-hand side
- Nested `test.step()` hierarchy with categories (`Step`, `API`, `Expect`, `Fixture`, `Hook`)
- Step filter box inside the selected test
- Trace **Download** and **Copy CLI Command** (static report friendly)
- Auto-selects the first failed test when opening the report
- Fully static HTML — open directly from disk, no server required

### Using both reports together

```typescript
reporter: [
  ['list'],
  ['playwright-runner-lm-reporter', { outputDir: 'playwright-lm-report-simple' }],
  ['playwright-runner-lm-reporter/advanced', { outputDir: 'playwright-lm-report-advanced' }],
],
```

## Configuration

Both reporters accept the same options:

```typescript
[
  'playwright-runner-lm-reporter/advanced',
  {
    outputDir: 'playwright-lm-report',
    reportTitle: 'My Product — Automation Report',
    reportSubtitle: 'Playwright E2E Suite',
    environmentVariable: 'TEST_ENV',
    defaultEnvironment: 'DEV',
    authorVariable: 'TEST_AUTHOR',
    defaultAuthor: 'QA Team',
    liveRefreshSeconds: 5,
    theme: 'light',
    analyticsDir: '.analytics',
  },
]
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `outputDir` | `string` | `'playwright-lm-report'` | Folder for HTML reports and copied artifacts |
| `reportTitle` | `string` | `'TDD-LM Automation Report'` | Main heading in the HTML report |
| `reportSubtitle` | `string` | `'Playwright Test Automation'` | Subtitle under the main heading |
| `environmentVariable` | `string` | `'TEST_ENV'` | Env var shown in the environment badge |
| `defaultEnvironment` | `string` | `'DEV'` | Fallback when the env var is unset |
| `authorVariable` | `string` | `'TEST_AUTHOR'` | Env var used for the Author column |
| `defaultAuthor` | `string` | `'QA'` | Fallback author when the env var is unset |
| `liveRefreshSeconds` | `number` | `5` (local) / `0` (CI) | Auto-refresh interval during live runs; set to `0` to disable |
| `analyticsDir` | `string` | `'.analytics'` | Project folder for historical JSON consumed by `historical-analytics-dashboard` |
| `theme` | `'light' \| 'dark'` | `'light'` | Report color theme for simple and advanced HTML output |

In Jenkins or any CI environment (`CI`, `JENKINS_URL`, or `BUILD_NUMBER` set), live refresh defaults to **0** so archived HTML stays stable after the run finishes.

## Jenkins integration

Every run writes **stable, predictable paths** under `{outputDir}/` so Jenkins can publish the latest report and email summaries without parsing timestamps.

| File | Purpose |
|------|---------|
| `index.html` | Full latest report — use with **HTML Publisher** (`reportFiles: 'index.html'`) |
| `latest.html` | Identical copy of the latest run — handy alias for scripts and links |
| `email-summary.txt` | Plain-text summary for **Email Extension** (`emailext`) body |
| `email-summary.html` | HTML summary for rich email or attachment |
| `latest-run.json` | Machine-readable manifest (stats, paths, Jenkins env when present) |
| `report_YYYYMMDD_HHMMSS.html` | Timestamped archive of each run |
| `history.html` | Browse all timestamped reports |

After each run the reporter logs these paths to the console:

```
✅ Report generated: playwright-lm-report/report_20250812_143022.html
📊 Jenkins HTML report: playwright-lm-report/index.html
📋 Latest report copy: playwright-lm-report/latest.html
📧 Email summary (text): playwright-lm-report/email-summary.txt
📧 Email summary (HTML): playwright-lm-report/email-summary.html
📄 Run manifest: playwright-lm-report/latest-run.json
```

### HTML Publisher

Install the [HTML Publisher Plugin](https://plugins.jenkins.io/htmlpublisher/), then publish from a fixed path:

```groovy
post {
    always {
        publishHTML(target: [
            allowMissing: true,
            alwaysLinkToLastBuild: true,
            keepAll: true,
            reportDir: 'playwright-lm-report',
            reportFiles: 'index.html',
            reportName: 'Playwright TDD-LM Report',
        ])
    }
}
```

`index.html` always contains the **most recent** full report, so the Jenkins sidebar link stays correct without updating `reportFiles` per build.

### Archive artifacts

Archive the stable files plus media so builds remain browsable offline:

```groovy
archiveArtifacts artifacts: 'playwright-lm-report/index.html', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/latest.html', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/email-summary.*', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/latest-run.json', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/report_*.html', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/screenshots/**', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/videos/**', allowEmptyArchive: true
archiveArtifacts artifacts: 'playwright-lm-report/traces/**', allowEmptyArchive: true
```

### Email after execution

Use the pre-built summaries with [Email Extension](https://plugins.jenkins.io/email-ext/):

```groovy
post {
    always {
        emailext(
            subject: '${DEFAULT_SUBJECT}',
            body: '${FILE,path="playwright-lm-report/email-summary.txt"}',
            mimeType: 'text/plain',
            attachmentsPattern: 'playwright-lm-report/index.html,playwright-lm-report/email-summary.html',
            to: '$DEFAULT_RECIPIENTS',
        )
    }
}
```

For HTML-only email bodies:

```groovy
emailext(
    subject: 'Playwright run — ${BUILD_STATUS}',
    body: '${FILE,path="playwright-lm-report/email-summary.html"}',
    mimeType: 'text/html',
    to: 'qa-team@example.com',
)
```

Email summaries include pass/fail counts, pass rate, duration, environment, failed test names with first error line, and a Jenkins build link when `BUILD_URL` is set.

### `latest-run.json` manifest

Downstream jobs, Slack bots, or notification scripts can read the last run without parsing HTML:

```json
{
  "runId": "20250812_143022",
  "status": "failed",
  "passed": 4,
  "failed": 1,
  "skipped": 0,
  "total": 5,
  "passRate": 80,
  "durationMs": 45230,
  "environment": "staging",
  "reportHtml": "playwright-lm-report/index.html",
  "latestHtml": "playwright-lm-report/latest.html",
  "emailSummaryText": "playwright-lm-report/email-summary.txt",
  "emailSummaryHtml": "playwright-lm-report/email-summary.html",
  "jenkins": {
    "buildUrl": "https://jenkins.example.com/job/e2e/42/",
    "jobName": "e2e",
    "buildNumber": "42"
  }
}
```

### Example Jenkinsfile

See [`example/Jenkinsfile`](example/Jenkinsfile) for a complete pipeline with install, test, HTML publish, artifact archive, and success/failure email.

## Static HTML — no server required

Unlike the Playwright default HTML report or Allure, both simple and advanced modes generate **fully static HTML** files. Open them directly from disk:

```bash
start playwright-lm-report/index.html
```

All screenshots, videos, and trace downloads use relative paths and work without `npx playwright show-report`.

For traces, use **Download Trace** in the report or run:

```bash
npx playwright show-trace playwright-lm-report/traces/trace_1.zip
```

## Historical analytics export

Each run writes analytics artifacts for the [historical-analytics-dashboard](https://github.com/LahiruMadhawaWork/historical-test-execution-analysis-dashboard):

| File | Location |
|------|----------|
| Run history | `.analytics/history.json` |
| Latest run detail | `.analytics/runs/run_<RUN_ID>.json` |
| Latest pointer | `.analytics/latest.json` |
| Report copy | `{outputDir}/.analytics/` |

These files follow a `RunMetric`-compatible shape (`tool: 'playwright'`) so they can be imported into the historical dashboard pipeline.

## Filters

Both reports provide compact inline filter bars with Status and Suite filters displayed side-by-side:

**Status:** All, Passed, Failed, Skipped  
**Suite:** All, Smoke, Regression, Functional

Filters wrap naturally to fit the available width. Tag tests with Playwright annotations such as `@smoke`, `@regression`, or `@functional` in the test or `describe` title.

### Light and dark themes

```typescript
['playwright-runner-lm-reporter/advanced', {
  outputDir: 'playwright-lm-report',
  theme: 'dark', // or 'light'
}],
```

## Opening reports

```bash
# Open directly — no server needed
start playwright-lm-report/index.html        # Windows
open playwright-lm-report/index.html         # macOS
xdg-open playwright-lm-report/index.html     # Linux
```

## Environment variables

```bash
export TEST_ENV=staging
export TEST_AUTHOR="Jane Doe"
npx playwright test
```

```powershell
$env:TEST_ENV = "staging"
$env:TEST_AUTHOR = "Jane Doe"
npx playwright test
```

## Recommended Playwright settings

```typescript
use: {
  trace: 'on',
  screenshot: 'on',
  video: 'on',
},
```

### Nested `test.step()` support

Both modes render nested steps from Playwright's result tree. Example:

```typescript
test('checkout flow', async ({ page }) => {
  await test.step('Login', async () => {
    await test.step('Enter credentials', async () => {
      await page.getByLabel('Email').fill('user@example.com');
    });
  });
});
```

Advanced mode shows these as an expandable tree with step categories, similar to the Playwright HTML report.

### Step-level screenshots

Name attachments with step index patterns so screenshots map to steps:

- `step-0-screenshot.png`
- `step_1_login.png`

### Step console logs

Attach plain-text logs named `step-{index}-logs`:

```typescript
await test.info().attach('step-0-logs', {
  body: 'Checking widgets...\nAll widgets visible',
  contentType: 'text/plain',
});
```

## Skip during `playwright test --list`

```typescript
const isListMode = process.argv.includes('--list');

export default defineConfig({
  reporter: isListMode
    ? [['list']]
    : [
        ['list'],
        ['playwright-runner-lm-reporter/advanced'],
      ],
});
```

## Programmatic imports

```typescript
import SimpleTddLmReporter from 'playwright-runner-lm-reporter';
import AdvancedTddLmReporter from 'playwright-runner-lm-reporter/advanced';
```

## Report output

| Output | Simple | Advanced |
|--------|--------|----------|
| Timestamped report | `{outputDir}/report_YYYYMMDD_HHMMSS.html` | same |
| Latest report (Jenkins) | `{outputDir}/index.html` | same |
| Latest alias | `{outputDir}/latest.html` | same |
| Email summary (text) | `{outputDir}/email-summary.txt` | same |
| Email summary (HTML) | `{outputDir}/email-summary.html` | same |
| Run manifest | `{outputDir}/latest-run.json` | same |
| Run history page | `{outputDir}/history.html` | same |
| Screenshots | `{outputDir}/screenshots/` | same |
| Videos | `{outputDir}/videos/` | same |
| Traces | `{outputDir}/traces/` | same |
| Analytics copy | `{outputDir}/.analytics/` | same |
| Project analytics | `.analytics/history.json` | same |

Add generated folders to `.gitignore`:

```gitignore
/playwright-lm-report/
/playwright-lm-report-simple/
/playwright-lm-report-advanced/
/.analytics/
```

## Example project

```bash
npm install
npm run build
cd example
npm install
npx playwright test
```

Then open `example/playwright-lm-report/index.html`.

For Jenkins, see `example/Jenkinsfile`.

## Development

```bash
npm install
npm run build
npm run example:install
npm run example:test
```

## Publish to npm

```bash
npm login
npm pack --dry-run
npm publish
```

## Requirements

- Node.js 18+
- `@playwright/test` >= 1.30.0 (peer dependency)

## License

MIT © [Lahiru Madhawa](https://github.com/LahiruMadhawaWork)

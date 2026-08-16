import { FullConfig } from '@playwright/test/reporter';

export type ReporterMode = 'simple' | 'advanced';

export type ReportTheme = 'light' | 'dark';

export interface TddLmReporterOptions {
    /** Report mode. Use the `/advanced` export for advanced mode. Default: `simple` */
    mode?: ReporterMode;
    /** Directory for HTML reports and assets. Default: `playwright-lm-report` */
    outputDir?: string;
    /** Main report title shown in the HTML header. */
    reportTitle?: string;
    /** Subtitle shown under the main title. */
    reportSubtitle?: string;
    /** Environment variable used for the environment badge. Default: `TEST_ENV` */
    environmentVariable?: string;
    /** Fallback environment label when the env var is unset. Default: `DEV` */
    defaultEnvironment?: string;
    /** Environment variable used for the author column. Default: `TEST_AUTHOR` */
    authorVariable?: string;
    /** Default author when the env var is unset. Default: `QA` */
    defaultAuthor?: string;
    /** Auto-refresh interval in seconds during live runs. Set to `0` to disable. Default: `5` */
    liveRefreshSeconds?: number;
    /** Folder for historical analytics JSON consumed by historical-analytics-dashboard. Default: `.analytics` */
    analyticsDir?: string;
    /** Report color theme. Default: `light` */
    theme?: ReportTheme;
}

export interface ResolvedReporterOptions extends Required<TddLmReporterOptions> {}

export interface StepData {
    id: string;
    title: string;
    category: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped';
    screenshot?: string;
    error?: string;
    stackTrace?: string;
    startTime: string;
    consoleLogs?: string[];
    stepIndex?: number;
    videoStartTime?: number;
    videoEndTime?: number;
    children?: StepData[];
}

export interface TestData {
    id: string;
    title: string;
    fullTitle: string;
    file: string;
    describePath: string[];
    location: string;
    duration: number;
    status: 'passed' | 'failed' | 'skipped' | 'timedOut';
    retry: number;
    screenshots: { name: string; path: string }[];
    steps: StepData[];
    video?: string;
    trace?: string;
    error?: string;
    errorStack?: string;
    tags: string[];
}

export interface SuiteStats {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
}

export interface ReportRenderContext {
    options: ResolvedReporterOptions;
    config: FullConfig;
    testResults: TestData[];
    suiteStats: SuiteStats;
    startTime: Date;
    endTime: Date;
    runId: string;
    environment: string;
    author: string;
    browserName: string;
    platform: string;
    liveRefreshSeconds: number;
}

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/visual",
  timeout: 45_000,
  expect: { timeout: 15_000 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  outputDir: "test-results",
  use: { baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000", trace: "retain-on-failure" },
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1536, height: 1024 } } },
    { name: "mobile-chromium", use: { ...devices["iPhone 13"], browserName: "chromium", isMobile: true, viewport: { width: 390, height: 844 } } },
  ],
  webServer: {
    command: "npm run start",
    url: process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",
    timeout: 90_000,
    reuseExistingServer: !process.env.CI,
  },
});

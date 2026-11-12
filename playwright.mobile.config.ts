import { defineConfig, devices } from "@playwright/test";

// Separate Safari-engine QA; install with: npx playwright install --with-deps webkit.
export default defineConfig({
  testDir: "./tests/visual",
  testMatch: /pixel-shop\.spec\.ts/,
  timeout: 60_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", {outputFolder:"playwright-mobile-report",open:"never"}]],
  outputDir: "test-results-mobile",
  use: {baseURL:process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",trace:"retain-on-failure"},
  projects: [{name:"mobile-webkit",use:{...devices["iPhone 13"],browserName:"webkit"}}],
  webServer:{command:"npm run start",url:process.env.PLAYWRIGHT_BASE_URL || "http://127.0.0.1:3000",timeout:120_000,reuseExistingServer:!process.env.CI}
});

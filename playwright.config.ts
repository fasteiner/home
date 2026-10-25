import { defineConfig, devices } from "@playwright/test";

// Usability tests against the production build (`npm run build` and
// `npm run build:pdf` first; `npm test` does all three). See tests/.
export default defineConfig({
  testDir: "tests",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1366, height: 900 } },
    },
    {
      // Layout-dependent checks also run on a phone.
      name: "mobile",
      use: { ...devices["Pixel 7"] },
      testMatch: /(a11y|layout|navigation)\.spec\.ts/,
    },
  ],
  webServer: {
    command: "npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173/en/",
    reuseExistingServer: !process.env.CI,
  },
});

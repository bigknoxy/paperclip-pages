import { defineConfig } from '@playwright/test'

export default defineConfig({
  use: {
    headless: true,
  },
  testDir: './e2e',
  webServer: {
    command: 'npm run dev -- --host --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: false,
    timeout: 120000
  }
})

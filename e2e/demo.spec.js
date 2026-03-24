import { test, expect } from '@playwright/test'

test('demo page saves note', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  await page.click('a[href="/demo"]')
  await page.fill('input', 'hello e2e')
  await page.click('button:has-text("Save")')
  await expect(page.locator('text=Saved')).toBeVisible()
})

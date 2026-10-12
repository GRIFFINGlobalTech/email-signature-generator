import { expect, test } from '@playwright/test'

test.describe('2.1.1-2.1.1: Verify each required field blocks submission when empty.', () => {
  test('requires every mandatory field before the form can continue', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#firstName-error')).toHaveText('First name is required')
    await expect(page.locator('#surname-error')).toHaveText('Surname is required')
    await expect(page.locator('#jobTitle-error')).toHaveText('Job title is required')
    await expect(page.locator('#email-error')).toHaveText('Company email is required')
    await expect(page.locator('#phone-error')).toHaveText('Phone number is required')
  })
})

import { expect, test } from '@playwright/test'

import { fillSignatureForm, invalidSignatureFixture, validWhitespaceSignatureFixture } from '../fixtures/signature'

test.describe('2.2.1-2.2.1: Validate email format and company domain, phone format, whitespace, and accepted input.', () => {
  test('flags invalid values and accepts valid values with extra whitespace', async ({ page }) => {
    await page.goto('/')

    await fillSignatureForm(page, invalidSignatureFixture)

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#email-error')).toHaveText('Use your @griffinglobaltech.com email')
    await expect(page.locator('#phone-error')).toHaveText(
      'Enter a valid phone number with country code, e.g. +1 (678) 261-8289',
    )

    await fillSignatureForm(page, validWhitespaceSignatureFixture)
    await page.locator('#firstName').blur()
    await page.locator('#surname').blur()
    await page.locator('#jobTitle').blur()
    await page.locator('#email').blur()
    await page.locator('#phone').blur()

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('heading', { name: "You're ready for a Griffin signature" })).toBeVisible()
    await expect(page.locator('.success-summary dd').nth(0)).toHaveText('Ada Lovelace')
    await expect(page.locator('.success-summary dd').nth(1)).toHaveText('Senior Product Engineer')
  })
})

import { expect, test } from '@playwright/test'

import { fillSignatureForm, invalidSignatureFixture, validWhitespaceSignatureFixture } from '../fixtures/signature'

test.describe('2.2.1-2.2.1: Validate email format and company domain, phone format, whitespace, and accepted input.', () => {
  test('keeps paired inputs aligned when one field displays a validation error', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 900 })
    await page.goto('/')
    await fillSignatureForm(page)

    const firstName = page.locator('#firstName')
    const surname = page.locator('#surname')
    const getTop = async (locator) => (await locator.boundingBox()).y
    const initialTopDifference = Math.abs((await getTop(firstName)) - (await getTop(surname)))
    expect(initialTopDifference).toBeLessThan(1)

    await firstName.fill('')
    await firstName.blur()
    await expect(page.locator('#firstName-error')).toBeVisible()

    const topDifferenceAfterError = Math.abs((await getTop(firstName)) - (await getTop(surname)))
    expect(topDifferenceAfterError).toBeLessThan(1)
  })

  test('rejects numeric-only job titles but accepts titles containing numbers', async ({ page }) => {
    await page.goto('/')

    await fillSignatureForm(page, { jobTitle: '12345' })
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#jobTitle-error')).toHaveText('Job title must include at least one letter')

    await page.locator('#jobTitle').fill('VP 2')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('heading', { name: "You're ready for a Griffin signature" })).toBeVisible()
  })

  test('flags invalid values and accepts valid values with extra whitespace', async ({ page }) => {
    await page.goto('/')

    await fillSignatureForm(page, invalidSignatureFixture)

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#email-error')).toHaveText(
      'Use your @griffinglobaltech.com or @thejitu.com email',
    )
    await expect(page.locator('#phone-error')).toHaveText(
      'Enter a valid phone number for the selected country',
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

  test('accepts a thejitu.com company email', async ({ page }) => {
    await page.goto('/')

    await fillSignatureForm(page, { email: 'ada.lovelace@thejitu.com' })
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('heading', { name: "You're ready for a Griffin signature" })).toBeVisible()
    await expect(page.locator('.success-summary dd').nth(2)).toHaveText('ada.lovelace@thejitu.com')
  })
})

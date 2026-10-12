import { expect, test } from '@playwright/test'

import { fillSignatureForm, signatureFixture } from '../fixtures/signature'

test.describe('2.3.1-2.3.2: Check valid submission, invalid-submission blocking, and helpful validation messages.', () => {
  test('2.3.1: submits valid details and moves into the signature studio', async ({ page }) => {
    await page.goto('/')

    await fillSignatureForm(page)

    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.getByRole('heading', { name: "You're ready for a Griffin signature" })).toBeVisible()
    await expect(page.locator('.success-summary dd').nth(0)).toHaveText(`${signatureFixture.firstName} ${signatureFixture.surname}`)
    await expect(page.locator('.success-summary dd').nth(1)).toHaveText(signatureFixture.jobTitle)
    await expect(page.locator('.success-summary dd').nth(2)).toHaveText(signatureFixture.email)

    await page.getByRole('button', { name: 'Generate signature' }).click()

    await expect(page.getByRole('heading', { name: "Ada Lovelace's Griffin signature" })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Light mode email signature for Ada Lovelace' })).toBeVisible()
  })

  test('2.3.2: blocks submission and shows clear validation messages when the form is incomplete', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Continue' }).click()

    await expect(page.locator('#firstName-error')).toHaveText('First name is required')
    await expect(page.locator('#surname-error')).toHaveText('Surname is required')
    await expect(page.locator('#jobTitle-error')).toHaveText('Job title is required')
    await expect(page.locator('#email-error')).toHaveText('Company email is required')
    await expect(page.locator('#phone-error')).toHaveText('Phone number is required')
  })
})

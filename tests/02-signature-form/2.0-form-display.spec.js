import { expect, test } from '@playwright/test'

import { fillSignatureForm, signatureFixture } from '../fixtures/signature'

test.describe('2.0.1-2.0.1: Check that required fields, labels, placeholders, and text entry are available.', () => {
  test('displays the signature form and accepts user input', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { name: 'Tell us who this signature is for' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Continue' })).toBeVisible()

    const fields = [
      { selector: '#firstName', label: 'First name' },
      { selector: '#surname', label: 'Surname' },
      { selector: '#jobTitle', label: 'Job title' },
      { selector: '#email', label: 'Company email' },
      { selector: '#phone', label: 'Phone' },
    ]

    for (const field of fields) {
      const input = page.locator(field.selector)
      const label = page.locator(`label[for="${field.selector.slice(1)}"]`)
      await expect(input).toBeVisible()
      await expect(input).toHaveAttribute('aria-invalid', 'false')
      await expect(label).toContainText(field.label)
    }

    await expect(page.locator('#firstName')).toHaveAttribute('placeholder', 'Dan')
    await expect(page.locator('#surname')).toHaveAttribute('placeholder', 'Hoover')
    await expect(page.locator('#jobTitle')).toHaveAttribute('placeholder', 'Chief Executive Officer')
    await expect(page.locator('#email')).toHaveAttribute('placeholder', 'name@griffinglobaltech.com')
    await expect(page.locator('#phone')).toHaveAttribute('placeholder', '+1 (678) 261-8289')

    await fillSignatureForm(page)

    await expect(page.locator('#firstName')).toHaveValue(signatureFixture.firstName)
    await expect(page.locator('#surname')).toHaveValue(signatureFixture.surname)
    await expect(page.locator('#jobTitle')).toHaveValue(signatureFixture.jobTitle)
    await expect(page.locator('#email')).toHaveValue(signatureFixture.email)
    await expect(page.locator('#phone')).toHaveValue(signatureFixture.phone)

    await expect(page.locator('[role="progressbar"]')).toBeVisible()
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute('aria-valuenow', '100')
  })
})

import { expect, test } from '@playwright/test'
import { fillSignatureForm } from '../fixtures/signature'

const viewports = [
  { width: 320, height: 740 },
  { width: 360, height: 780 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
]

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => {
    const root = document.documentElement
    const overflowingElements = [...document.body.querySelectorAll('*')]
      .map((element) => {
        const bounds = element.getBoundingClientRect()
        return {
          element: `${element.tagName.toLowerCase()}${element.className ? `.${String(element.className).replaceAll(' ', '.')}` : ''}`,
          left: Math.round(bounds.left),
          right: Math.round(bounds.right),
          width: Math.round(bounds.width),
        }
      })
      .filter(({ left, right }) => left < 0 || right > window.innerWidth)
      .slice(0, 5)

    return {
      viewportWidth: window.innerWidth,
      rootWidth: root.clientWidth,
      rootScrollWidth: root.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
      overflowingElements,
    }
  })

  expect(dimensions.rootScrollWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.rootWidth,
  )
  expect(dimensions.bodyScrollWidth, JSON.stringify(dimensions)).toBeLessThanOrEqual(
    dimensions.rootWidth,
  )
}

async function expectMobileActionLayout(page, groupSelector, buttonCount) {
  const buttons = await page.locator(`${groupSelector} .btn`).evaluateAll((elements) =>
    elements.map((element) => {
      const { x, y, width } = element.getBoundingClientRect()
      return { x, y, width }
    }),
  )

  expect(buttons).toHaveLength(buttonCount)
  if (buttonCount === 2) {
    expect(Math.abs(buttons[0].y - buttons[1].y)).toBeLessThan(1)
    expect(Math.abs(buttons[0].width - buttons[1].width)).toBeLessThan(1)
    expect(buttons[0].x).toBeLessThan(buttons[1].x)
    return
  }

  expect(buttons[0].y).toBeLessThan(buttons[1].y)
  expect(Math.abs(buttons[1].y - buttons[2].y)).toBeLessThan(1)
  expect(Math.abs(buttons[1].width - buttons[2].width)).toBeLessThan(1)
  expect(buttons[1].x).toBeLessThan(buttons[2].x)
}

test.describe('5.2.1-5.2.x: Check the complete workflow at desktop, tablet, and mobile viewports.', () => {
  for (const viewport of viewports) {
    test(`keeps the workflow usable at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport)
      await page.goto('/')

      await expect(page.getByRole('heading', { name: 'Tell us who this signature is for' })).toBeVisible()
      await expectNoHorizontalOverflow(page)
      if (viewport.width < 760) {
        await expectMobileActionLayout(page, '.form-actions--form', 2)
      }

      const themeToggle = page.locator('.theme-toggle')
      const initialThemeTarget = await themeToggle.getAttribute('aria-label')
      await themeToggle.click()
      await expect(themeToggle).not.toHaveAttribute('aria-label', initialThemeTarget)

      const countryPickerTrigger = page.getByRole('button', { name: 'Choose country calling code' })
      await countryPickerTrigger.click()
      await expect(countryPickerTrigger).toHaveAttribute('aria-expanded', 'true')
      const countryMenu = page.locator('.phone-country-menu')
      await expect(countryMenu).toBeVisible()
      const menuBounds = await countryMenu.boundingBox()
      expect(menuBounds).not.toBeNull()
      expect(menuBounds.x).toBeGreaterThanOrEqual(0)
      expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(viewport.width)
      await page.getByRole('combobox', { name: 'Search countries or calling codes' }).press('Escape')

      await fillSignatureForm(page)
      await page.getByRole('button', { name: 'Continue' }).click()
      await expect(page.getByRole('heading', { name: "You're ready for a Griffin signature" })).toBeVisible()
      await expectNoHorizontalOverflow(page)
      if (viewport.width < 760) {
        await expectMobileActionLayout(page, '.form-actions--success', 3)
      }

      await page.getByRole('button', { name: 'Generate signature' }).click()
      await expect(page.getByRole('heading', { name: "Ada Lovelace's Griffin signature" })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Download PNG' })).toBeEnabled()
      await expectNoHorizontalOverflow(page)

      const previewStage = page.locator('.signature-stage')
      const stageHasNoHorizontalOverflow = await previewStage.evaluate(
        (stage) => stage.scrollWidth <= stage.clientWidth,
      )
      expect(stageHasNoHorizontalOverflow).toBe(true)

      await page.getByRole('radio', { name: 'Dark' }).click()
      await page.locator('.switch').click()
      await expect(page.getByRole('checkbox', { name: 'Show transparency' })).toBeChecked()
      await expect(page.getByRole('button', { name: 'Copy signature' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Back to details' })).toBeVisible()
      await expectNoHorizontalOverflow(page)
      if (viewport.width < 760) {
        await expectMobileActionLayout(page, '.studio__actions', 3)
      }
    })
  }
})

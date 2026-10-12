export const signatureFixture = Object.freeze({
  firstName: 'Ada',
  surname: 'Lovelace',
  jobTitle: 'Senior Product Engineer',
  email: 'ada.lovelace@griffinglobaltech.com',
  phone: '+1 (678) 261-8289',
})

export const invalidSignatureFixture = Object.freeze({
  firstName: ' Ada ',
  surname: ' Lovelace ',
  jobTitle: 'Senior Product Engineer',
  email: 'ada@example.com',
  phone: '12345',
})

export const validWhitespaceSignatureFixture = Object.freeze({
  firstName: ' Ada ',
  surname: ' Lovelace ',
  jobTitle: 'Senior Product Engineer',
  email: '  ADA.LOVELACE@GRIFFINGLOBALTECH.COM  ',
  phone: '  +1 (678) 261-8289  ',
})

export async function fillSignatureForm(page, overrides = {}) {
  const details = { ...signatureFixture, ...overrides }

  await page.locator('#firstName').fill(details.firstName)
  await page.locator('#surname').fill(details.surname)
  await page.locator('#jobTitle').fill(details.jobTitle)
  await page.locator('#email').fill(details.email)
  await page.locator('#phone').fill(details.phone)
}

import { z } from 'zod'
import type { CountryCode } from 'libphonenumber-js'
import {
  isPhoneCountryCode,
  isValidPhoneForCountry,
  normalizePhoneNumber,
} from '../utils/phone'
import { COMPANY_EMAIL_DOMAINS } from '../config/signature'

const namePattern = /^[\p{L}][\p{L} .'-]*$/u

const requiredName = (label: string) =>
  z.string().trim().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: `${label} is required` })
      return
    }
    if (value.length < 2) {
      ctx.addIssue({ code: 'custom', message: `${label} must be at least 2 characters` })
      return
    }
    if (value.length > 50) {
      ctx.addIssue({ code: 'custom', message: `${label} must be 50 characters or fewer` })
      return
    }
    if (!namePattern.test(value)) {
      ctx.addIssue({
        code: 'custom',
        message: `${label} can only include letters, spaces, hyphens, and apostrophes`,
      })
    }
  })

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || z.url().safeParse(value).success, {
    message: 'Enter a valid URL, including https://',
  })

const signatureFormFields = z.object({
  firstName: requiredName('First name'),
  surname: requiredName('Surname'),
  jobTitle: z.string().trim().superRefine((value, ctx) => {
    if (!value) {
      ctx.addIssue({ code: 'custom', message: 'Job title is required' })
      return
    }
    if (value.length < 2) {
      ctx.addIssue({ code: 'custom', message: 'Job title must be at least 2 characters' })
      return
    }
    if (value.length > 80) {
      ctx.addIssue({ code: 'custom', message: 'Job title must be 80 characters or fewer' })
    }
  }),
  email: z
    .string()
    .trim()
    .min(1, 'Company email is required')
    .pipe(z.email({ error: 'Enter a valid email address' }))
    .transform((value) => value.toLowerCase())
    .refine((value) => COMPANY_EMAIL_DOMAINS.some((domain) => value.endsWith(`@${domain}`)), {
      message: `Use your ${COMPANY_EMAIL_DOMAINS.map((domain) => `@${domain}`).join(' or ')} email`,
    }),
  phoneCountry: z.custom<CountryCode>(isPhoneCountryCode, {
    message: 'Select a valid country calling code',
  }),
  phone: z.string().trim().min(1, 'Phone number is required'),
  linkedinUrl: optionalUrl,
  calendarUrl: optionalUrl,
})

export const signatureFormSchema = signatureFormFields
  .superRefine(({ phone, phoneCountry }, ctx) => {
    if (phone && isPhoneCountryCode(phoneCountry) && !isValidPhoneForCountry(phone, phoneCountry)) {
      ctx.addIssue({
        code: 'custom',
        path: ['phone'],
        message: 'Enter a valid phone number for the selected country',
      })
    }
  })
  .transform(({ phone, phoneCountry, ...details }) => ({
    ...details,
    phone: normalizePhoneNumber(phone, phoneCountry),
    phoneCountry,
  }))

export type SignatureFormInput = z.input<typeof signatureFormSchema>
export type SignatureFormData = z.output<typeof signatureFormSchema>

export const signatureFormDefaults = {
  firstName: '',
  surname: '',
  jobTitle: '',
  email: '',
  phone: '',
  phoneCountry: 'US',
  linkedinUrl: '',
  calendarUrl: '',
} satisfies SignatureFormInput

export const REQUIRED_FIELDS = [
  'firstName',
  'surname',
  'jobTitle',
  'email',
  'phone',
] as const satisfies readonly (keyof SignatureFormInput)[]

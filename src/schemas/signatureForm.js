import { z } from 'zod'

const COMPANY_EMAIL_DOMAIN = 'griffinglobaltech.com'

const namePattern = /^[\p{L}][\p{L} .'-]*$/u
const phonePattern = /^\+?[0-9](?:[0-9\s().-]{6,22}[0-9])$/

const requiredName = (label) =>
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

const optionalText = (max, label) =>
  z
    .string()
    .trim()
    .max(max, `${label} must be ${max} characters or fewer`)
    .optional()
    .or(z.literal(''))

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || z.url().safeParse(value).success, {
    message: 'Enter a valid URL, including https://',
  })

export const signatureFormSchema = z.object({
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
    .refine((value) => value.endsWith(`@${COMPANY_EMAIL_DOMAIN}`), {
      message: `Use your @${COMPANY_EMAIL_DOMAIN} email`,
    }),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(phonePattern, 'Enter a valid phone number with country code, e.g. +1 (678) 261-8289'),
  linkedinUrl: optionalUrl,
  calendarUrl: optionalUrl,
})

export const signatureFormDefaults = {
  firstName: '',
  surname: '',
  jobTitle: '',
  email: '',
  phone: '',
  linkedinUrl: '',
  calendarUrl: '',
}

export const REQUIRED_FIELDS = ['firstName', 'surname', 'jobTitle', 'email', 'phone']

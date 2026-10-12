import { useMemo, useState } from 'react'
import { Controller, useForm, useWatch, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormField } from './FormField'
import { SignatureStudio } from './SignatureStudio'
import {
  REQUIRED_FIELDS,
  signatureFormDefaults,
  signatureFormSchema,
  type SignatureFormData,
  type SignatureFormInput,
} from '../schemas/signatureForm'
import { formatPhoneNumber } from '../utils/phone'
import { PhoneCountryPicker } from './PhoneCountryPicker'

function capitalizeTitle(value: string) {
  return value.replace(/(^|[\s-])(\p{L})/gu, (_, separator: string, letter: string) =>
    `${separator}${letter.toUpperCase()}`,
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 10.5 8.2 13.8 15 6.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SignatureForm() {
  const [signatureDetails, setSignatureDetails] = useState<SignatureFormData | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting, isSubmitSuccessful, dirtyFields, touchedFields },
  } = useForm<SignatureFormInput, unknown, SignatureFormData>({
    resolver: zodResolver(signatureFormSchema),
    defaultValues: signatureFormDefaults,
    mode: 'onTouched',
    reValidateMode: 'onChange',
  })

  const values = useWatch({ control })

  const completedRequired = useMemo(
    () =>
      REQUIRED_FIELDS.filter((field) => {
        const value = values[field]
        return typeof value === 'string' && value.trim().length > 0 && !errors[field]
      }).length,
    [errors, values],
  )

  const progress = Math.round((completedRequired / REQUIRED_FIELDS.length) * 100)

  const onSubmit: SubmitHandler<SignatureFormData> = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 450))
    console.info('Signature form submitted', data)
  }

  if (isSubmitSuccessful && signatureDetails) {
    return <SignatureStudio details={signatureDetails} onBack={() => setSignatureDetails(null)} />
  }

  if (isSubmitSuccessful) {
    return (
      <section className="form-card form-card--success" aria-live="polite">
        <div className="success-mark" aria-hidden="true">
          <CheckIcon />
        </div>
        <p className="eyebrow">Details captured</p>
        <h2>You&apos;re ready for a Griffin signature</h2>
        <p className="lede">
          {values.firstName} {values.surname}&apos;s details passed validation. Preview and
          generation come next.
        </p>
        <dl className="success-summary">
          <div>
            <dt>Name</dt>
            <dd>
              {values.firstName} {values.surname}
            </dd>
          </div>
          <div>
            <dt>Title</dt>
            <dd>{values.jobTitle}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{values.email}</dd>
          </div>
          <div>
            <dt>Phone</dt>
            <dd>
              {values.phone && values.phoneCountry
                ? formatPhoneNumber(values.phone, values.phoneCountry)
                : ''}
            </dd>
          </div>
        </dl>
        <div className="form-actions form-actions--success">
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => setSignatureDetails(signatureFormSchema.parse(values))}
          >
            Generate signature
          </button>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => reset(signatureFormDefaults)}
          >
            Enter another person
          </button>
          <button type="button" className="btn btn--ghost" onClick={() => reset(values)}>
            Edit these details
          </button>
        </div>
      </section>
    )
  }

  return (
    <form className="form-card" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="form-card__header">
        <p className="eyebrow">Email signature</p>
        <h1>Tell us who this signature is for</h1>
        <p className="lede">
          Required fields match Griffin Global Technologies standards: first name, surname,
          job title, company email, and phone.
        </p>

        <div className="progress" aria-label="Required fields completed">
          <div className="progress__meta">
            <span>
              {completedRequired} of {REQUIRED_FIELDS.length} required fields
            </span>
            <span>{progress}%</span>
          </div>
          <div className="progress__track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <span className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <fieldset className="form-section">
        <legend>Identity</legend>
        <div className="form-grid">
          <FormField id="firstName" label="First name" required error={errors.firstName?.message}>
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('firstName')}
                autoComplete="given-name"
                placeholder="Dan"
              />
            )}
          </FormField>
          <FormField id="surname" label="Surname" required error={errors.surname?.message}>
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('surname')}
                autoComplete="family-name"
                placeholder="Hoover"
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Role</legend>
        <div className="form-grid">
          <FormField
            id="jobTitle"
            label="Job title"
            required
            error={errors.jobTitle?.message}
            className="span-2"
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('jobTitle', {
                  onChange: (event) => {
                    event.currentTarget.value = capitalizeTitle(event.currentTarget.value)
                  },
                })}
                autoComplete="organization-title"
                placeholder="Chief Executive Officer"
              />
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="form-section">
        <legend>Contact</legend>
        <div className="form-grid">
          <FormField
            id="email"
            label="Company email"
            required
            error={errors.email?.message}
            hint="Use your @griffinglobaltech.com or @thejitu.com address."
            className="span-2"
          >
            {(fieldProps) => (
              <input
                {...fieldProps}
                {...register('email')}
                type="email"
                inputMode="email"
                autoComplete="off"
                placeholder="name@griffinglobaltech.com"
              />
            )}
          </FormField>
          <FormField
            id="phone"
            label="Phone"
            required
            error={errors.phone?.message}
            hint="Type a country name in the dropdown; its calling code appears beside it."
          >
            {(fieldProps) => (
              <div className="phone-field">
                <Controller
                  name="phoneCountry"
                  control={control}
                  render={({ field }) => (
                    <PhoneCountryPicker
                      value={field.value}
                      onChange={field.onChange}
                      describedBy="phone-hint"
                      error={errors.phoneCountry?.message}
                    />
                  )}
                />
                <input
                  {...fieldProps}
                  {...register('phone')}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="678 261 8289"
                />
              </div>
            )}
          </FormField>
        </div>
      </fieldset>

      <div className="company-note" role="note">
        <p>
          Company name, website, and Alpharetta headquarters are applied automatically to every
          Griffin signature.
        </p>
        <ul>
          <li>Griffin Global Technologies</li>
          <li>griffinglobaltech.com</li>
          <li>1165 Sanctuary Parkway, Suite 300, Alpharetta, GA 30009</li>
        </ul>
      </div>

      {Object.keys(errors).length > 0 && (Object.keys(dirtyFields).length > 0 || Object.keys(touchedFields).length > 0) ? (
        <p className="form-banner" role="alert">
          Fix the highlighted fields before continuing.
        </p>
      ) : null}

      <div className="form-actions form-actions--form">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? 'Validating…' : 'Continue'}
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => reset(signatureFormDefaults)}
        >
          Clear form
        </button>
      </div>
    </form>
  )
}

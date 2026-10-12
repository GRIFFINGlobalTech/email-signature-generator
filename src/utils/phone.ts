import {
  getCountries,
  getCountryCallingCode,
  isValidPhoneNumber,
  parsePhoneNumberWithError,
  type CountryCode,
} from 'libphonenumber-js'

const countryNames = new Intl.DisplayNames(['en'], { type: 'region' })
const countryCodes = new Set<string>(getCountries())
const countriesWithoutFlagAssets = new Set(['AC', 'TA'])

export const PHONE_COUNTRIES = getCountries()
  .map((code) => ({
    code,
    name: countryNames.of(code) ?? code,
    callingCode: `+${getCountryCallingCode(code)}`,
    hasFlagAsset: !countriesWithoutFlagAssets.has(code),
  }))
  .sort((first, second) => first.name.localeCompare(second.name))

export const isPhoneCountryCode = (value: unknown): value is CountryCode =>
  typeof value === 'string' && countryCodes.has(value)

export const isValidPhoneForCountry = (phone: string, country: CountryCode) =>
  isValidPhoneNumber(phone, country)

export const normalizePhoneNumber = (phone: string, country: CountryCode) =>
  parsePhoneNumberWithError(phone, country).number

export const formatPhoneNumber = (phone: string, country: CountryCode) =>
  parsePhoneNumberWithError(phone, country).formatInternational()

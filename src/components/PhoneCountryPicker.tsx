import { useEffect, useId, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { CountryCode } from 'libphonenumber-js'
import 'flag-icons/css/flag-icons.min.css'
import { PHONE_COUNTRIES } from '../utils/phone'

type PhoneCountryPickerProps = {
  value: CountryCode
  onChange: (country: CountryCode) => void
  describedBy?: string
  error?: string
}

type PhoneCountry = (typeof PHONE_COUNTRIES)[number]

function CountryFlag({ country }: { country: PhoneCountry }) {
  return country.hasFlagAsset ? (
    <span className={`fi fi-${country.code.toLowerCase()}`} aria-hidden="true" />
  ) : (
    <span className="phone-country-flag-fallback" aria-label={`${country.name} flag unavailable`}>
      {country.code}
    </span>
  )
}

export function PhoneCountryPicker({
  value,
  onChange,
  describedBy,
  error,
}: PhoneCountryPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const pickerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const listboxId = useId()
  const activeOptionId = `${listboxId}-option-${activeIndex}`
  const selectedCountry = PHONE_COUNTRIES.find((country) => country.code === value)
  const filteredCountries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()
    if (!normalizedQuery) return PHONE_COUNTRIES

    return PHONE_COUNTRIES.filter(({ name, callingCode, code }) =>
      `${name} ${callingCode} ${code}`.toLocaleLowerCase().includes(normalizedQuery),
    )
  }, [query])

  useEffect(() => {
    if (!isOpen) return

    searchRef.current?.focus()
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !pickerRef.current?.contains(event.target)) {
        setIsOpen(false)
        setQuery('')
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    return () => document.removeEventListener('pointerdown', closeOnOutsideClick)
  }, [isOpen])

  const chooseCountry = (country: PhoneCountry) => {
    onChange(country.code)
    setIsOpen(false)
    setQuery('')
    setActiveIndex(0)
    triggerRef.current?.focus()
  }

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown' && filteredCountries.length) {
      event.preventDefault()
      setActiveIndex((index) => (index + 1) % filteredCountries.length)
    } else if (event.key === 'ArrowUp' && filteredCountries.length) {
      event.preventDefault()
      setActiveIndex((index) => (index - 1 + filteredCountries.length) % filteredCountries.length)
    } else if (event.key === 'Enter' && filteredCountries[activeIndex]) {
      event.preventDefault()
      chooseCountry(filteredCountries[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      setIsOpen(false)
      setQuery('')
      triggerRef.current?.focus()
    }
  }

  return (
    <div className={`phone-country-picker${isOpen ? ' is-open' : ''}`} ref={pickerRef}>
      <button
        className="phone-country-trigger"
        ref={triggerRef}
        type="button"
        aria-label="Choose country calling code"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-describedby={describedBy}
        aria-invalid={Boolean(error)}
        onClick={() => setIsOpen((open) => !open)}
      >
        {selectedCountry ? (
          <>
            <CountryFlag country={selectedCountry} />
            <span className="phone-country-trigger__dial-code">{selectedCountry.callingCode}</span>
          </>
        ) : (
          <span>Select country</span>
        )}
        <span className="phone-country-trigger__chevron" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="phone-country-menu">
          <input
            ref={searchRef}
            className="phone-country-search"
            type="search"
            role="combobox"
            aria-label="Search countries or calling codes"
            aria-autocomplete="list"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={
              filteredCountries.length ? activeOptionId : undefined
            }
            placeholder="Search countries or codes"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={handleSearchKeyDown}
          />
          <div className="phone-country-options" id={listboxId} role="listbox">
            {filteredCountries.length ? (
              filteredCountries.map((country, index) => (
                <div
                  key={country.code}
                  id={`${listboxId}-option-${index}`}
                  className={`phone-country-option${index === activeIndex ? ' is-active' : ''}`}
                  role="option"
                  aria-selected={country.code === value}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseCountry(country)}
                >
                  <CountryFlag country={country} />
                  <span className="phone-country-option__name">{country.name}</span>
                  <span className="phone-country-option__dial-code">{country.callingCode}</span>
                </div>
              ))
            ) : (
              <p className="phone-country-empty">No matching country or calling code</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

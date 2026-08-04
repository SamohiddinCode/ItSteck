// Mirrors backend/app/utils/phone.py — keep the two in step.

export const COUNTRY_CODE = '998'
export const SUBSCRIBER_LENGTH = 9

// 90–99 as a whole range — see the note in backend/app/utils/phone.py.
const MOBILE_PREFIXES = ['20', '33', '50', '55', '77', '88',
  ...Array.from({ length: 10 }, (_, i) => String(90 + i))]
const GEOGRAPHIC_PREFIXES = Array.from({ length: 19 }, (_, i) => String(61 + i))
const VALID_PREFIXES = new Set([...MOBILE_PREFIXES, ...GEOGRAPHIC_PREFIXES])

const onlyDigits = (value) => String(value ?? '').replace(/\D/g, '')

/**
 * The 9 subscriber digits, from anything a user might paste. The input keeps
 * "+998" outside the field, so a leading country code here means a paste.
 */
export function subscriberDigits(value) {
  let digits = onlyDigits(value).replace(/^0+/, '')
  if (digits.length > SUBSCRIBER_LENGTH && digits.startsWith(COUNTRY_CODE)) {
    digits = digits.slice(COUNTRY_CODE.length)
  }
  return digits.slice(0, SUBSCRIBER_LENGTH)
}

/** "901234567" → "90 123 45 67", formatting only as far as the user has typed. */
export function formatSubscriber(digits) {
  const d = subscriberDigits(digits)
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ')
}

export function isValidSubscriber(digits) {
  const d = subscriberDigits(digits)
  return d.length === SUBSCRIBER_LENGTH && VALID_PREFIXES.has(d.slice(0, 2))
}

/** What the API stores: +998XXXXXXXXX. */
export const toE164 = (digits) => `+${COUNTRY_CODE}${subscriberDigits(digits)}`

/** Pretty-print a stored number; anything unrecognised is shown untouched. */
export function formatPhone(stored) {
  if (!stored) return '—'
  const digits = onlyDigits(stored)
  if (digits.length !== COUNTRY_CODE.length + SUBSCRIBER_LENGTH || !digits.startsWith(COUNTRY_CODE)) {
    return stored
  }
  return `+${COUNTRY_CODE} ${formatSubscriber(digits.slice(COUNTRY_CODE.length))}`
}

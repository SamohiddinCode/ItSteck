import clsx from 'clsx'
import { COUNTRY_CODE, formatSubscriber, subscriberDigits } from '@/utils/phone'

/**
 * Holds the 9 subscriber digits; `onChange` receives those digits, not an event.
 * The country code sits outside the field so a pasted "+998…" can never be
 * confused with a subscriber number that happens to start with 998.
 */
export default function PhoneInput({ label, error, value, onChange, className, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="label">{label}</label>}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm font-mono select-none pointer-events-none">
          +{COUNTRY_CODE}
        </span>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          value={formatSubscriber(value)}
          onChange={(e) => onChange(subscriberDigits(e.target.value))}
          className={clsx(
            'input-field pl-[4.5rem] font-mono tracking-wide',
            error && 'border-danger focus:border-danger focus:ring-danger/20',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}

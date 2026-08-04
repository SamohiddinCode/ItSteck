import { Instagram } from 'lucide-react'

/** Overridable at build time so the handles can change without a code edit. */
const TELEGRAM_URL = import.meta.env.VITE_TELEGRAM_URL || 'https://t.me/itstek'
const INSTAGRAM_URL = import.meta.env.VITE_INSTAGRAM_URL || 'https://instagram.com/itstek'

/* Telegram paper-plane glyph — lucide ships no brand mark for it.
   Path from Font Awesome Free (telegram-plane), CC BY 4.0. */
function TelegramIcon({ className }) {
  return (
    <svg viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1l-236 148.6-101.6-31.8c-22.1-6.9-22.5-22.1 4.6-32.7l396.3-152.7c18.4-6.9 34.5 4.1 28.6 32.5z" />
    </svg>
  )
}

const socials = [
  { href: TELEGRAM_URL, label: 'Telegram', icon: <TelegramIcon className="w-4 h-4" /> },
  { href: INSTAGRAM_URL, label: 'Instagram', icon: <Instagram className="w-[18px] h-[18px]" strokeWidth={1.8} /> },
]

export default function SocialLinks({ className = '' }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {socials.map(({ href, label, icon }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          title={label}
          className="w-9 h-9 rounded-xl border border-border bg-surface-2 flex items-center justify-center
                     text-muted hover:text-primary hover:border-primary/30 hover:bg-primary/5
                     transition-all duration-200"
        >
          {icon}
        </a>
      ))}
    </div>
  )
}

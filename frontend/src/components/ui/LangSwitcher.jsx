import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, Check } from 'lucide-react'
import clsx from 'clsx'
import { useI18n, LANGUAGES } from '@/i18n'

export default function LangSwitcher({ align = 'right', className }) {
  const { lang, setLang, t } = useI18n()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div ref={ref} className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('lang.label')}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-sm font-medium
                   text-muted hover:text-text hover:bg-surface-2 transition-colors"
      >
        <Globe className="w-4 h-4" />
        {current.short}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'absolute top-full mt-2 w-40 rounded-xl border border-border bg-surface shadow-card overflow-hidden z-50',
              align === 'right' ? 'right-0' : 'left-0'
            )}
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLang(l.code); setOpen(false) }}
                className={clsx(
                  'w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors',
                  l.code === lang ? 'text-primary bg-primary/5' : 'text-muted hover:text-text hover:bg-surface-2'
                )}
              >
                {l.label}
                {l.code === lang && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

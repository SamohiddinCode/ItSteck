import { createContext, useContext, useCallback, useMemo, useState } from 'react'
import ru from './locales/ru'
import en from './locales/en'
import uz from './locales/uz'
import { setDateLocale } from '@/utils/formatters'

export const LANGUAGES = [
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'uz', label: "O'zbekcha", short: 'UZ' },
]

const dictionaries = { ru, en, uz }
const DEFAULT_LANG = 'ru'
const STORAGE_KEY = 'itstek_lang'

const I18nContext = createContext(null)

const readStoredLang = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return dictionaries[saved] ? saved : DEFAULT_LANG
  } catch {
    return DEFAULT_LANG
  }
}

const lookup = (dict, key) =>
  key.split('.').reduce((acc, part) => (acc == null ? acc : acc[part]), dict)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readStoredLang)

  const setLang = useCallback((next) => {
    if (!dictionaries[next]) return
    try { localStorage.setItem(STORAGE_KEY, next) } catch { /* private mode — keep the in-memory choice */ }
    setLangState(next)
  }, [])

  // Dates come from a plain module, so keep its locale in sync during render —
  // an effect would leave the first frame after a switch formatted in the old one.
  setDateLocale(lang)
  document.documentElement.lang = lang

  const t = useCallback((key, vars) => {
    // Fall back to Russian, then the key itself: a missing string stays visible but harmless.
    const raw = lookup(dictionaries[lang], key) ?? lookup(dictionaries[DEFAULT_LANG], key) ?? key
    if (typeof raw !== 'string' || !vars) return raw
    return raw.replace(/\{(\w+)\}/g, (match, name) => (vars[name] ?? match))
  }, [lang])

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}

/** Shorthand for the common case: `const t = useT()`. */
export const useT = () => useI18n().t

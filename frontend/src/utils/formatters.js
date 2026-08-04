const INTL_LOCALES = { ru: 'ru-RU', en: 'en-US', uz: 'uz-UZ' }

// Kept in a module variable rather than passed to every call site — the i18n
// provider updates it whenever the language changes.
let intlLocale = INTL_LOCALES.ru

export const setDateLocale = (lang) => { intlLocale = INTL_LOCALES[lang] || INTL_LOCALES.ru }

export const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric', month: 'short', day: 'numeric',
  }).format(new Date(dateStr))
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—'
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr))
}

export const truncate = (str, n = 120) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

export const getInitials = (name = '') =>
  name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)

export const statusColors = {
  new: { bg: 'bg-info/10', text: 'text-info', dot: 'bg-info' },
  contacted: { bg: 'bg-warning/10', text: 'text-warning', dot: 'bg-warning' },
  registered: { bg: 'bg-success/10', text: 'text-success', dot: 'bg-success' },
  rejected: { bg: 'bg-danger/10', text: 'text-danger', dot: 'bg-danger' },
}

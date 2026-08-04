import { Link } from 'react-router-dom'
import { useT } from '@/i18n'

export default function NotFound() {
  const t = useT()

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-display text-8xl font-bold text-primary/20 mb-4">404</p>
      <h1 className="font-display text-3xl font-bold text-text mb-3">{t('notFound.title')}</h1>
      <p className="text-muted mb-8">{t('notFound.text')}</p>
      <Link to="/" className="btn bg-primary hover:bg-primary-hover text-white h-10 px-6 text-sm">
        {t('notFound.home')}
      </Link>
    </div>
  )
}

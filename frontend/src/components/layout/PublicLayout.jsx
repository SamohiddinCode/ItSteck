import { Link, Outlet } from 'react-router-dom'
import { Phone } from 'lucide-react'
import Navbar from './Navbar'
import PromoTicker from '@/components/ui/PromoTicker'
import SocialLinks from '@/components/ui/SocialLinks'
import { CONTACT_PHONE } from '@/config'
import { formatPhone } from '@/utils/phone'
import { useT } from '@/i18n'

export default function PublicLayout() {
  const t = useT()

  return (
    <div className="min-h-screen bg-bg bg-noise">
      {/* Sticky rather than fixed: the ticker is only there when the director
          has a live promo, and sticky keeps the page flow correct either way. */}
      <div className="sticky top-0 z-40">
        <PromoTicker />
        <Navbar />
      </div>
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-border mt-24 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-muted text-sm">{t('footer.rights')}</p>
            <a href={`tel:${CONTACT_PHONE}`}
              className="inline-flex items-center gap-2 text-text text-sm font-medium mt-2 hover:text-primary transition-colors">
              <Phone className="w-3.5 h-3.5 text-primary" />
              {formatPhone(CONTACT_PHONE)}
            </a>
          </div>
          <div className="flex items-center gap-6">
            <SocialLinks />
            <Link to="/privacy" className="text-muted/60 text-xs hover:text-muted transition-colors">Конфиденциальность</Link>
            <Link to="/terms" className="text-muted/60 text-xs hover:text-muted transition-colors">Условия</Link>
            <Link to="/admin/login" className="text-muted/50 text-xs hover:text-muted transition-colors">
              {t('footer.admin')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Logo from '@/components/ui/Logo'
import LangSwitcher from '@/components/ui/LangSwitcher'
import SocialLinks from '@/components/ui/SocialLinks'
import { useT } from '@/i18n'

const links = [
  { to: '/', key: 'nav.home' },
  { to: '/courses', key: 'nav.courses' },
  { to: '/test', key: 'nav.test' },
  { to: '/business', key: 'nav.business' },
  { to: '/about', key: 'nav.about' },
  { to: '/verify', key: 'nav.verify' },
  { to: '/apply', key: 'nav.apply' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const t = useT()

  return (
    // Positioning lives in PublicLayout, which stacks this under the promo ticker.
    <header className="relative bg-bg/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center group">
          <Logo className="h-9 transition-opacity group-hover:opacity-80" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.to ? 'text-text bg-surface-2' : 'text-muted hover:text-text hover:bg-surface-2/50'
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LangSwitcher />
          <a
            href="/#/apply"
            className="hidden lg:inline-flex btn bg-primary hover:bg-primary-hover text-white h-9 px-5 text-sm rounded-xl"
          >
            {t('nav.getStarted')}
          </a>
          <button onClick={() => setOpen(!open)} aria-label={open ? 'Закрыть меню' : 'Открыть меню'} aria-expanded={open} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-bg/95 overflow-hidden"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {links.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-muted hover:text-text hover:bg-surface-2 transition-colors">
                  {t(l.key)}
                </Link>
              ))}
              <SocialLinks className="px-4 pt-3 mt-2 border-t border-border/60" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

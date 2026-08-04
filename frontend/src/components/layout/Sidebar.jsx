import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Users, UserCheck, LogOut, Award, ShieldCheck, Tag,
} from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import Logo from '@/components/ui/Logo'
import LangSwitcher from '@/components/ui/LangSwitcher'
import { getInitials } from '@/utils/formatters'
import { useT } from '@/i18n'
import clsx from 'clsx'

// `roles` lists who may see the entry; leads is the only section managers get.
const nav = [
  { to: '/admin', key: 'admin.nav.dashboard', icon: LayoutDashboard, end: true, roles: ['admin'] },
  { to: '/admin/courses', key: 'admin.nav.courses', icon: BookOpen, roles: ['admin'] },
  { to: '/admin/teachers', key: 'admin.nav.teachers', icon: Users, roles: ['admin'] },
  { to: '/admin/leads', key: 'admin.nav.leads', icon: UserCheck, roles: ['admin', 'manager'] },
  { to: '/admin/certificates', key: 'admin.nav.certificates', icon: Award, roles: ['admin'] },
  { to: '/admin/promotions', key: 'admin.nav.promotions', icon: Tag, roles: ['admin'] },
  { to: '/admin/users', key: 'admin.nav.team', icon: ShieldCheck, roles: ['admin'] },
]

export default function Sidebar() {
  const { logout, user, role } = useAuth()
  const navigate = useNavigate()
  const t = useT()

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  const items = nav.filter((item) => item.roles.includes(role))

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-surface border-r border-border h-screen sticky top-0">
      {/* Logo */}
      <div className="px-6 h-16 flex items-center justify-between border-b border-border">
        <Logo className="h-8" />
        <LangSwitcher />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1 overflow-y-auto">
        <p className="text-muted/50 text-xs font-medium uppercase tracking-widest px-4 mb-3">{t('admin.menu')}</p>
        {items.map(({ to, key, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              clsx('sidebar-link', isActive && 'active')
            }
          >
            <Icon className="w-4 h-4" />
            {t(key)}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 border-t border-border flex flex-col gap-1">
        {user?.full_name && (
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-[10px] font-bold">{getInitials(user.full_name)}</span>
            </div>
            <div className="min-w-0">
              <p className="text-text text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-muted text-xs">{t(`roles.${role}.label`)}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout}
          className="sidebar-link w-full text-danger/70 hover:text-danger hover:bg-danger/10">
          <LogOut className="w-4 h-4" />
          {t('admin.signOut')}
        </button>
      </div>
    </aside>
  )
}

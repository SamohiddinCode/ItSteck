import clsx from 'clsx'
import { statusColors } from '@/utils/formatters'
import { useT } from '@/i18n'

const variants = {
  default: 'bg-surface-2 text-muted',
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
  info: 'bg-info/10 text-info',
}

export default function Badge({ children, variant = 'default', className }) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }) {
  const t = useT()
  const colors = statusColors[status] || statusColors.new
  return (
    <span className={clsx('badge', colors.bg, colors.text)}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', colors.dot)} />
      {t(`statuses.${status}`)}
    </span>
  )
}

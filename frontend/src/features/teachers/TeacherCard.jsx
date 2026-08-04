import { ArrowRight, User } from 'lucide-react'
import { truncate } from '@/utils/formatters'
import { useT } from '@/i18n'

export default function TeacherCard({ teacher, onLearnMore }) {
  const t = useT()

  return (
    <div className="group card p-6 h-full flex flex-col gap-4 hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300">
      <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center shrink-0">
        {teacher.photo_url ? (
          <img src={teacher.photo_url} alt={teacher.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <User className="w-8 h-8 text-muted/30" />
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <h3 className="font-display text-base font-semibold text-text group-hover:text-primary transition-colors">
          {teacher.name}
        </h3>
        <p className="text-muted text-sm leading-relaxed flex-1">{truncate(teacher.bio, 110)}</p>
      </div>

      <button
        type="button"
        onClick={onLearnMore}
        className="inline-flex items-center gap-1.5 self-start text-primary hover:text-primary-hover text-sm font-medium transition-colors"
      >
        {t('landing.teachers.learnMore')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </button>
    </div>
  )
}

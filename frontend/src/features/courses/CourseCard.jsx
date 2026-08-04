import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen } from 'lucide-react'
import { truncate } from '@/utils/formatters'
import { useT } from '@/i18n'

export default function CourseCard({ course }) {
  const t = useT()

  return (
    <Link to={`/courses/${course.id}`} className="group card p-6 flex flex-col gap-4 hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 block">
      {/* Image */}
      <div className="w-full h-44 rounded-xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
        {course.image_url ? (
          <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <BookOpen className="w-10 h-10 text-muted/30" />
        )}
      </div>
      {/* Content */}
      <div className="flex-1 flex flex-col gap-2">
        <h3 className="font-display text-base font-semibold text-text group-hover:text-primary transition-colors line-clamp-2">
          {course.title}
        </h3>
        <p className="text-muted text-sm leading-relaxed flex-1">{truncate(course.description, 100)}</p>
      </div>
      <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
        {t('courses.learnMore')} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  )
}

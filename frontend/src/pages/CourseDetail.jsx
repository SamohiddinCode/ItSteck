import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen } from 'lucide-react'
import { courseService } from '@/services/courseService'
import Spinner from '@/components/ui/Spinner'
import { useT } from '@/i18n'

export default function CourseDetail() {
  const t = useT()
  const { id } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    courseService.get(id)
      .then(setCourse)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  if (error || !course) return (
    <div className="text-center py-32">
      <p className="text-muted mb-4">{t('courseDetail.notFound')}</p>
      <Link to="/courses" className="text-primary hover:text-primary-hover text-sm">{t('courseDetail.backLink')}</Link>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/courses" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> {t('courseDetail.back')}
        </Link>

        {course.image_url ? (
          <img src={course.image_url} alt={course.title}
            className="w-full h-72 object-cover rounded-2xl border border-border mb-8" />
        ) : (
          <div className="w-full h-72 rounded-2xl border border-border bg-surface-2 flex items-center justify-center mb-8">
            <BookOpen className="w-16 h-16 text-muted/20" />
          </div>
        )}

        <h1 className="font-display text-4xl font-bold text-text mb-4">{course.title}</h1>
        <p className="text-muted text-lg leading-relaxed mb-10">{course.description}</p>

        <Link to={`/apply?course=${course.id}`}
          className="btn bg-primary hover:bg-primary-hover text-white h-12 px-8 text-base shadow-glow">
          {t('courseDetail.apply')} →
        </Link>
      </motion.div>
    </div>
  )
}

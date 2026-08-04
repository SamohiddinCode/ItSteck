import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Shield, Globe, ChevronRight, BookOpen, Users, Award, User } from 'lucide-react'
import { courseService } from '@/services/courseService'
import { teacherService } from '@/services/teacherService'
import CourseCard from '@/features/courses/CourseCard'
import TeacherCard from '@/features/teachers/TeacherCard'
import Modal from '@/components/ui/Modal'
import { useT } from '@/i18n'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay, ease: [0.25, 0.1, 0.25, 1] },
})

const features = [
  { icon: Zap, key: 'fast' },
  { icon: Shield, key: 'experts' },
  { icon: Globe, key: 'anywhere' },
]

const stats = [
  { icon: BookOpen, value: '50+', key: 'courses' },
  { icon: Users, value: '12K+', key: 'students' },
  { icon: Award, value: '98%', key: 'satisfaction' },
]

export default function Landing() {
  const t = useT()
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [activeTeacher, setActiveTeacher] = useState(null)

  useEffect(() => {
    courseService.list({ active_only: true, size: 3 })
      .then((d) => setCourses(d.items || []))
      .catch(() => {})
    teacherService.list({ size: 4 })
      .then((d) => setTeachers(d.items || []))
      .catch(() => {})
  }, [])

  return (
    <div className="overflow-x-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 py-24">
        {/* bg glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-purple-800/10 rounded-full blur-[100px]" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp(0.1)} className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse2" />
            {t('landing.badge')}
          </motion.div>

          <motion.h1 {...fadeUp(0.2)} className="font-display text-5xl md:text-7xl font-bold text-text leading-[1.05] tracking-tight mb-6">
            {t('landing.titleBefore')}{' '}
            <span className="text-gradient">{t('landing.titleAccent')}</span>{' '}
            {t('landing.titleAfter')}
          </motion.h1>

          <motion.p {...fadeUp(0.3)} className="text-muted text-xl md:text-2xl leading-relaxed max-w-2xl mx-auto mb-10">
            {t('landing.subtitle')}
          </motion.p>

          <motion.div {...fadeUp(0.4)} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses" className="btn bg-primary hover:bg-primary-hover text-white h-12 px-8 text-base shadow-glow hover:shadow-glow">
              {t('landing.browse')} <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/apply" className="btn bg-surface-2 hover:bg-border text-text border border-border h-12 px-8 text-base">
              {t('landing.apply')} <ChevronRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Stats row */}
          <motion.div {...fadeUp(0.5)} className="flex items-center justify-center gap-10 mt-16 pt-10 border-t border-border/50">
            {stats.map(({ value, key }) => (
              <div key={key} className="text-center">
                <p className="font-display text-3xl font-bold text-text">{value}</p>
                <p className="text-muted text-sm mt-0.5">{t(`landing.stats.${key}`)}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp()} className="text-center mb-16">
          <h2 className="section-title mb-4">{t('landing.features.heading')}</h2>
          <p className="text-muted text-lg max-w-xl mx-auto">{t('landing.features.sub')}</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, key }, i) => (
            <motion.div key={key} {...fadeUp(i * 0.1)}
              className="card p-8 hover:border-primary/30 hover:shadow-glow-sm transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display text-lg font-semibold text-text mb-2">{t(`landing.features.${key}.title`)}</h3>
              <p className="text-muted leading-relaxed">{t(`landing.features.${key}.desc`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Teachers */}
      {teachers.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/30">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="section-title mb-4">{t('landing.teachers.heading')}</h2>
            <p className="text-muted text-lg max-w-xl mx-auto">{t('landing.teachers.sub')}</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {teachers.map((teacher, i) => (
              <motion.div key={teacher.id} {...fadeUp(i * 0.08)}>
                <TeacherCard teacher={teacher} onLearnMore={() => setActiveTeacher(teacher)} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Teacher bio — the full text the card truncates */}
      <Modal open={!!activeTeacher} onClose={() => setActiveTeacher(null)} title={activeTeacher?.name || ''}>
        {activeTeacher && (
          <div className="flex flex-col sm:flex-row gap-6">
            <div className="w-24 h-24 shrink-0 rounded-2xl overflow-hidden bg-surface-2 border border-border flex items-center justify-center">
              {activeTeacher.photo_url ? (
                <img src={activeTeacher.photo_url} alt={activeTeacher.name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-muted/30" />
              )}
            </div>
            <p className="text-muted leading-relaxed whitespace-pre-line">{activeTeacher.bio}</p>
          </div>
        )}
      </Modal>

      {/* Featured courses */}
      {courses.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-border/30">
          <motion.div {...fadeUp()} className="flex items-end justify-between mb-12">
            <div>
              <h2 className="section-title mb-2">{t('landing.featured.heading')}</h2>
              <p className="text-muted">{t('landing.featured.sub')}</p>
            </div>
            <Link to="/courses" className="hidden md:flex items-center gap-2 text-primary hover:text-primary-hover text-sm font-medium transition-colors">
              {t('landing.featured.viewAll')} <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {courses.map((c, i) => (
              <motion.div key={c.id} {...fadeUp(i * 0.1)}>
                <CourseCard course={c} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div {...fadeUp()} className="relative card p-12 md:p-16 text-center overflow-hidden glow-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          <h2 className="section-title mb-4 relative">{t('landing.cta.heading')}</h2>
          <p className="text-muted text-lg mb-8 max-w-lg mx-auto relative">
            {t('landing.cta.sub')}
          </p>
          <Link to="/apply" className="btn bg-primary hover:bg-primary-hover text-white h-12 px-10 text-base shadow-glow relative">
            {t('landing.cta.button')} <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>
    </div>
  )
}

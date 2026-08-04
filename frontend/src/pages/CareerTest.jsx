import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Compass, CheckCircle, ArrowLeft, RotateCcw, ArrowRight } from 'lucide-react'
import { courseService } from '@/services/courseService'
import CourseCard from '@/features/courses/CourseCard'
import Button from '@/components/ui/Button'
import { QUESTIONS, DIRECTIONS, scoreAnswers, matchCourses } from '@/features/test/questions'
import { useI18n } from '@/i18n'

export default function CareerTest() {
  const { lang, t } = useI18n()
  const [params] = useSearchParams()
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState([])
  const [courses, setCourses] = useState([])

  // Only shown when the visitor arrived straight from the application form.
  const justApplied = params.get('applied') === '1'

  useEffect(() => {
    courseService.list({ active_only: true, size: 100 })
      .then((d) => setCourses(d.items || []))
      .catch(() => {})
  }, [])

  const finished = step >= QUESTIONS.length
  const question = QUESTIONS[step]

  const choose = (optionIndex) => {
    setAnswers((prev) => {
      const next = [...prev]
      next[step] = optionIndex
      return next
    })
    setStep((s) => s + 1)
  }

  const restart = () => { setAnswers([]); setStep(0) }

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      {justApplied && !finished && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/10 px-4 py-3.5 mb-10">
          <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-success text-sm font-medium">{t('apply.successTitle')}</p>
            <p className="text-muted text-sm mt-0.5">{t('test.afterApply')}</p>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-7 h-7 text-primary" />
        </div>
        <h1 className="section-title mb-3">{t('test.title')}</h1>
        <p className="text-muted text-lg">{t('test.subtitle')}</p>
      </motion.div>

      {!finished ? (
        <div className="card p-6 md:p-8">
          <div className="flex items-center justify-between mb-6">
            <span className="text-muted text-sm">
              {t('test.progress', { current: step + 1, total: QUESTIONS.length })}
            </span>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)}
                className="text-muted hover:text-text text-sm flex items-center gap-1.5 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> {t('test.back')}
              </button>
            )}
          </div>

          <div className="h-1 rounded-full bg-surface-2 mb-8 overflow-hidden">
            <motion.div className="h-full bg-primary rounded-full"
              animate={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              transition={{ duration: 0.3 }} />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={question.id} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }}>
              <h2 className="font-display text-xl font-semibold text-text mb-6">
                {question.text[lang]}
              </h2>
              <div className="flex flex-col gap-3">
                {question.options.map((option, i) => (
                  <button key={i} onClick={() => choose(i)}
                    className={`text-left px-5 py-4 rounded-xl border transition-all duration-200 ${
                      answers[step] === i
                        ? 'border-primary bg-primary/10 text-text'
                        : 'border-border bg-surface-2 text-muted hover:border-primary/40 hover:text-text'
                    }`}>
                    {option.text[lang]}
                  </button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ) : (
        <Result answers={answers} courses={courses} lang={lang} t={t} onRestart={restart} />
      )}
    </div>
  )
}

function Result({ answers, courses, lang, t, onRestart }) {
  const { top } = scoreAnswers(answers)
  const direction = DIRECTIONS[top]
  const recommended = matchCourses(courses, top)

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="card p-6 md:p-8 glow-border mb-10">
        <p className="label mb-2">{t('test.resultLabel')}</p>
        <h2 className="font-display text-3xl font-bold text-gradient mb-4">
          {direction.title[lang]}
        </h2>
        <p className="text-muted leading-relaxed">{direction.summary[lang]}</p>
      </div>

      {recommended.length > 0 && (
        <div className="mb-10">
          <h3 className="page-title mb-6">{t('test.recommended')}</h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {recommended.slice(0, 4).map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/apply" className="flex-1">
          <Button size="lg" className="w-full">
            {t('test.apply')} <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
        <Button variant="secondary" size="lg" onClick={onRestart} className="flex-1">
          <RotateCcw className="w-4 h-4" /> {t('test.restart')}
        </Button>
      </div>
    </motion.div>
  )
}

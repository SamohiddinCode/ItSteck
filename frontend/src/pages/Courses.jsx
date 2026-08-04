import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { courseService } from '@/services/courseService'
import CourseCard from '@/features/courses/CourseCard'
import Spinner from '@/components/ui/Spinner'
import { useT } from '@/i18n'

export default function Courses() {
  const t = useT()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState({})

  useEffect(() => {
    setLoading(true)
    courseService.list({ active_only: true, page, size: 9 })
      .then((d) => { setCourses(d.items || []); setMeta(d) })
      .finally(() => setLoading(false))
  }, [page])

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
        <h1 className="font-display text-5xl font-bold text-text mb-3">{t('courses.title')}</h1>
        <p className="text-muted text-lg">{t('courses.subtitle')}</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-10 max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('courses.searchPlaceholder')}
          className="input-field pl-11"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-muted">{t('courses.empty')}</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <CourseCard course={c} />
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.pages > 1 && (
        <div className="flex justify-center gap-2 mt-12">
          {Array.from({ length: meta.pages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-primary text-white' : 'text-muted hover:text-text hover:bg-surface-2'}`}>
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

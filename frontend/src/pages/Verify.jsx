import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, Search, FileText, Download, XCircle } from 'lucide-react'
import { certificateService } from '@/services/certificateService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { formatDate } from '@/utils/formatters'
import { useT } from '@/i18n'

export default function Verify() {
  const t = useT()
  const [params, setParams] = useSearchParams()
  const [code, setCode] = useState(params.get('code') || '')
  const [result, setResult] = useState(null)
  // Holds a translation key so the message follows a language switch.
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async (value) => {
    const query = (value ?? code).trim()
    if (!query) {
      setError('verify.emptyCode')
      setResult(null)
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      setResult(await certificateService.verify(query))
      setParams({ code: query }, { replace: true })
    } catch (err) {
      setError(err?.response?.status === 404 ? 'verify.notFound' : 'verify.failed')
    } finally {
      setLoading(false)
    }
  }

  // Support deep links straight from a printed certificate: /verify?code=ITS-XXXX
  useEffect(() => {
    const initial = params.get('code')
    if (initial) lookup(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <ShieldCheck className="w-7 h-7 text-primary" />
        </div>
        <h1 className="section-title mb-3">{t('verify.title')}</h1>
        <p className="text-muted text-lg">{t('verify.subtitle')}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }} className="card p-6 md:p-8">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
          <div className="flex-1">
            <Input
              label={t('verify.codeLabel')}
              placeholder={t('verify.codePlaceholder')}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              className="font-mono tracking-wide uppercase"
              autoFocus
            />
          </div>
          <Button onClick={() => lookup()} loading={loading} size="lg" className="sm:w-40">
            <Search className="w-4 h-4" /> {t('verify.button')}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div key="error" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3.5">
              <XCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
              <p className="text-danger text-sm">{t(error)}</p>
            </motion.div>
          )}

          {result && (
            <motion.div key="result" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }} className="mt-8">
              <div className="flex items-center gap-2.5 rounded-xl border border-success/20 bg-success/10 px-4 py-3 mb-8">
                <ShieldCheck className="w-5 h-5 text-success flex-shrink-0" />
                <p className="text-success text-sm font-medium">{t('verify.verified')}</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-8">
                <Field label={t('verify.student')} value={result.student_name} />
                <Field label={t('verify.course')} value={result.course_title} />
                <Field label={t('verify.code')} value={result.code} mono />
                <Field label={t('verify.issued')} value={formatDate(result.issued_at)} />
              </div>

              {result.subjects?.length > 0 && (
                <div className="mb-8">
                  <p className="label mb-3">{t('verify.grades')}</p>
                  <div className="rounded-xl border border-border overflow-hidden">
                    {result.subjects.map((s, i) => (
                      <div key={`${s.subject}-${i}`}
                        className="flex items-center justify-between gap-4 px-4 py-3 border-b border-border/60 last:border-0">
                        <span className="text-text text-sm">{s.subject}</span>
                        <span className="text-primary font-semibold text-sm flex-shrink-0">{s.grade}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <a href={certificateService.pdfUrl(result.code)} target="_blank" rel="noreferrer"
                  className="btn bg-primary hover:bg-primary-hover text-white h-11 px-6 text-sm rounded-xl flex-1">
                  <FileText className="w-4 h-4" /> {t('verify.openPdf')}
                </a>
                <a href={certificateService.pdfUrl(result.code, { download: true })}
                  className="btn bg-surface-2 hover:bg-border text-text border border-border h-11 px-6 text-sm rounded-xl flex-1">
                  <Download className="w-4 h-4" /> {t('verify.download')}
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

function Field({ label, value, mono }) {
  return (
    <div>
      <p className="label mb-1.5">{label}</p>
      <p className={`text-text ${mono ? 'font-mono tracking-wide' : 'font-medium'}`}>{value}</p>
    </div>
  )
}

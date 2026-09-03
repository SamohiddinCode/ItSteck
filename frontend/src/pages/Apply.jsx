import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { courseService } from '@/services/courseService'
import { leadService } from '@/services/leadService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Select } from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import { isValidSubscriber, toE164, formatPhone } from '@/utils/phone'
import { isValidHandle, normalizeHandle } from '@/utils/telegram'
import { CONTACT_PHONE } from '@/config'
import { useT } from '@/i18n'

export default function Apply() {
  const t = useT()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    name: '',
    phone: '',
    telegram_username: '',
    course_id: params.get('course') || '',
  })
  // Errors hold translation keys, so they follow a language switch.
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [consent, setConsent] = useState(false)

  useEffect(() => {
    courseService.list({ active_only: true, size: 100 })
      .then((d) => setCourses(d.items || []))
      .catch(() => {})
  }, [])

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'apply.nameRequired'
    if (!form.phone) e.phone = 'apply.phoneRequired'
    else if (!isValidSubscriber(form.phone)) e.phone = 'apply.phoneInvalid'
    // Optional field — only checked once something has been typed.
    if (form.telegram_username.trim() && !isValidHandle(form.telegram_username)) {
      e.telegram_username = 'apply.telegramInvalid'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setLoading(true)
    try {
      const payload = { name: form.name.trim(), phone: toE164(form.phone) }
      if (form.telegram_username.trim()) {
        payload.telegram_username = normalizeHandle(form.telegram_username)
      }
      if (form.course_id) payload.course_id = form.course_id
      await leadService.create(payload)
      // Straight into the orientation test — the confirmation is shown there.
      navigate('/test?applied=1')
    } catch (err) {
      setErrors(err?.response?.status === 422
        ? { submit: 'apply.checkFields' }
        : { submit: 'apply.failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto px-6 py-20">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-text mb-3">{t('apply.title')}</h1>
          <p className="text-muted">{t('apply.subtitle')}</p>
        </div>

        <div className="card p-8 flex flex-col gap-5">
          <Input
            label={t('apply.name')}
            placeholder={t('apply.namePlaceholder')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name && t(errors.name)}
          />
          <PhoneInput
            label={t('apply.phone')}
            placeholder={t('apply.phonePlaceholder')}
            value={form.phone}
            onChange={(phone) => setForm({ ...form, phone })}
            error={errors.phone && t(errors.phone)}
          />
          <Input
            label={t('apply.telegram')}
            placeholder={t('apply.telegramPlaceholder')}
            value={form.telegram_username}
            onChange={(e) => setForm({ ...form, telegram_username: e.target.value })}
            error={errors.telegram_username && t(errors.telegram_username)}
          />
          {courses.length > 0 && (
            <Select
              label={t('apply.course')}
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            >
              <option value="">{t('apply.selectCourse')}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </Select>
          )}
          {errors.submit && <p className="text-sm text-danger">{t(errors.submit)}</p>}
          <label className="flex items-start gap-3 text-xs text-muted leading-relaxed cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-violet-600" />
            <span>Я согласен на обработку персональных данных и принимаю <Link to="/privacy" className="text-primary hover:underline">политику конфиденциальности</Link>.</span>
          </label>
          <Button onClick={handleSubmit} disabled={!consent} loading={loading} size="lg" className="mt-2 w-full">
            {t('apply.submit')}
          </Button>
        </div>

        <a href={`tel:${CONTACT_PHONE}`}
          className="mt-8 flex items-center justify-center gap-2.5 text-muted text-sm hover:text-primary transition-colors">
          <Phone className="w-4 h-4 text-primary" />
          <span>{t('contact.callUs')}:</span>
          <span className="text-text font-medium">{formatPhone(CONTACT_PHONE)}</span>
        </a>
      </motion.div>
    </div>
  )
}

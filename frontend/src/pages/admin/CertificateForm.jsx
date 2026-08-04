import { useEffect, useState } from 'react'
import { Plus, Trash2, GraduationCap } from 'lucide-react'
import { certificateService } from '@/services/certificateService'
import { courseService } from '@/services/courseService'
import Button from '@/components/ui/Button'
import Input, { Select } from '@/components/ui/Input'

const emptyRow = () => ({ subject: '', grade: '' })

export default function CertificateForm({ certificate, onSuccess, onCancel }) {
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    student_name: certificate?.student_name || '',
    course_id: certificate?.course_id || '',
    course_title: certificate?.course_title || '',
  })
  const [rows, setRows] = useState(
    certificate?.subjects?.length ? certificate.subjects.map((s) => ({ ...s })) : [emptyRow()]
  )
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    courseService.list({ size: 100 })
      .then((d) => setCourses(d.items || []))
      .catch(() => {})
  }, [])

  const setRow = (i, patch) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((prev) => [...prev, emptyRow()])
  const removeRow = (i) =>
    setRows((prev) => (prev.length === 1 ? [emptyRow()] : prev.filter((_, idx) => idx !== i)))

  // Enter on the last grade field adds another row — keeps data entry fast.
  const handleRowKey = (e, i) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    if (i === rows.length - 1) addRow()
  }

  const filledRows = () =>
    rows
      .map((r) => ({ subject: r.subject.trim(), grade: String(r.grade).trim() }))
      .filter((r) => r.subject || r.grade)

  const validate = () => {
    const e = {}
    if (!form.student_name.trim()) e.student_name = 'Student name is required'
    if (!form.course_id && !form.course_title.trim()) {
      e.course = 'Pick a course or type a title'
    }
    if (filledRows().some((r) => !r.subject || !r.grade)) {
      e.rows = 'Every row needs both a subject and a grade'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setLoading(true)
    try {
      const payload = {
        student_name: form.student_name.trim(),
        course_id: form.course_id || null,
        // Only send a manual title when no course is linked; otherwise the
        // backend snapshots the course's own title.
        course_title: form.course_id ? null : form.course_title.trim(),
        subjects: filledRows(),
      }
      const saved = certificate
        ? await certificateService.update(certificate.id, payload)
        : await certificateService.create(payload)
      onSuccess(saved)
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Input
        label="Student full name"
        placeholder="e.g. Samohiddin Tolibov"
        value={form.student_name}
        onChange={(e) => setForm({ ...form, student_name: e.target.value })}
        error={errors.student_name}
        autoFocus
      />

      <Select
        label="Course"
        value={form.course_id}
        onChange={(e) => setForm({ ...form, course_id: e.target.value })}
        error={errors.course}
      >
        <option value="">— Not linked (type a title below) —</option>
        {courses.map((c) => (
          <option key={c.id} value={c.id}>{c.title}</option>
        ))}
      </Select>

      {!form.course_id && (
        <Input
          label="Course title"
          placeholder="e.g. Full-Stack Web Development"
          value={form.course_title}
          onChange={(e) => setForm({ ...form, course_title: e.target.value })}
        />
      )}

      <div className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <label className="label flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5" /> Subjects &amp; grades
          </label>
          <button type="button" onClick={addRow}
            className="text-primary hover:text-primary-hover text-xs font-medium flex items-center gap-1 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add subject
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="input-field flex-1"
                placeholder={`Subject ${i + 1}`}
                value={row.subject}
                onChange={(e) => setRow(i, { subject: e.target.value })}
                onKeyDown={(e) => handleRowKey(e, i)}
              />
              <input
                className="input-field w-24 text-center"
                placeholder="Grade"
                value={row.grade}
                onChange={(e) => setRow(i, { grade: e.target.value })}
                onKeyDown={(e) => handleRowKey(e, i)}
              />
              <button type="button" onClick={() => removeRow(i)}
                className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        {errors.rows && <p className="text-xs text-danger">{errors.rows}</p>}
        <p className="text-muted/60 text-xs">
          Press Enter on the last row to add another. Empty rows are ignored.
        </p>
      </div>

      {errors.submit && <p className="text-sm text-danger">{errors.submit}</p>}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {certificate ? 'Save Changes' : 'Issue Certificate'}
        </Button>
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  )
}

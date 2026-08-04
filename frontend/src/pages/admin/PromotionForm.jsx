import { useState } from 'react'
import { promotionService } from '@/services/promotionService'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

/** `datetime-local` speaks local wall time; the API speaks ISO/UTC. */
const toInput = (iso) => {
  if (!iso) return ''
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
const toIso = (value) => (value ? new Date(value).toISOString() : null)

export default function PromotionForm({ promotion, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    text: promotion?.text || '',
    discount: promotion?.discount || '',
    link_url: promotion?.link_url || '',
    is_active: promotion?.is_active ?? true,
    starts_at: toInput(promotion?.starts_at),
    ends_at: toInput(promotion?.ends_at),
    sort_order: promotion?.sort_order ?? 0,
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }))

  const validate = () => {
    const e = {}
    if (!form.text.trim()) e.text = 'The announcement text is required'
    if (form.starts_at && form.ends_at && new Date(form.ends_at) < new Date(form.starts_at)) {
      e.ends_at = 'The end must come after the start'
    }
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setLoading(true)
    try {
      const payload = {
        text: form.text.trim(),
        discount: form.discount.trim() || null,
        link_url: form.link_url.trim() || null,
        is_active: form.is_active,
        starts_at: toIso(form.starts_at),
        ends_at: toIso(form.ends_at),
        sort_order: Number(form.sort_order) || 0,
      }
      const saved = promotion
        ? await promotionService.update(promotion.id, payload)
        : await promotionService.create(payload)
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
        label="Announcement"
        placeholder="e.g. 30% off the Python course until 1 August"
        value={form.text}
        onChange={(e) => set({ text: e.target.value })}
        error={errors.text}
        maxLength={255}
        autoFocus
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Discount badge (optional)"
          placeholder="e.g. -30%"
          value={form.discount}
          onChange={(e) => set({ discount: e.target.value })}
          maxLength={32}
        />
        <Input
          label="Link (optional)"
          placeholder="/courses"
          value={form.link_url}
          onChange={(e) => set({ link_url: e.target.value })}
          maxLength={512}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label="Starts (optional)"
          type="datetime-local"
          value={form.starts_at}
          onChange={(e) => set({ starts_at: e.target.value })}
        />
        <Input
          label="Ends (optional)"
          type="datetime-local"
          value={form.ends_at}
          onChange={(e) => set({ ends_at: e.target.value })}
          error={errors.ends_at}
        />
      </div>
      <p className="text-muted/60 text-xs -mt-3">
        Leave the dates empty to run the promo until you switch it off.
      </p>

      <div className="grid sm:grid-cols-2 gap-4 items-end">
        <Input
          label="Order"
          type="number"
          value={form.sort_order}
          onChange={(e) => set({ sort_order: e.target.value })}
        />
        <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-2 border border-border cursor-pointer">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set({ is_active: e.target.checked })}
            className="w-4 h-4 accent-primary"
          />
          <span className="text-text text-sm">Active</span>
        </label>
      </div>

      {errors.submit && <p className="text-sm text-danger">{errors.submit}</p>}

      <div className="flex gap-3 pt-2">
        <Button onClick={handleSubmit} loading={loading} className="flex-1">
          {promotion ? 'Save Changes' : 'Add Promo'}
        </Button>
        <Button variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </div>
  )
}

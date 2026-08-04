import { useState } from 'react'
import { userService, ROLES } from '@/services/userService'
import { useAuth } from '@/features/auth/AuthContext'
import Button from '@/components/ui/Button'
import Input, { Select } from '@/components/ui/Input'

export default function UserForm({ user, onSuccess, onCancel }) {
  const { user: me } = useAuth()
  const isEdit = !!user
  // Changing your own role would lock you out, so the server refuses it either way.
  const isSelf = isEdit && user.id === me?.id
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'manager',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const validate = () => {
    const e = {}
    if (form.full_name.trim().length < 2) e.full_name = 'Full name is required'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required'
    if (!isEdit || form.password) {
      if (form.password.length < 8) e.password = 'At least 8 characters'
    }
    return e
  }

  const handleSubmit = async (ev) => {
    ev?.preventDefault()
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setErrors({})
    setLoading(true)
    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        role: form.role,
      }
      if (form.password) payload.password = form.password

      if (isEdit) {
        await userService.update(user.id, payload)
      } else {
        await userService.create(payload)
      }
      onSuccess()
    } catch (err) {
      setErrors({ submit: err?.response?.data?.detail || 'Something went wrong' })
    } finally {
      setLoading(false)
    }
  }

  const roleHint = ROLES.find((r) => r.value === form.role)?.hint

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input label="Full Name" placeholder="e.g. Aziza Karimova"
        value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })}
        error={errors.full_name} />

      <Input label="Email" type="email" placeholder="manager@itstek.com" autoComplete="off"
        value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={errors.email} />

      <Input
        label={isEdit ? 'New Password (leave blank to keep current)' : 'Password'}
        type="password" placeholder="••••••••" autoComplete="new-password"
        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
        error={errors.password} />

      <div className="flex flex-col gap-1.5">
        <Select label="Role" value={form.role} disabled={isSelf}
          className={isSelf ? 'opacity-60 cursor-not-allowed' : undefined}
          onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </Select>
        <p className="text-xs text-muted">
          {isSelf ? 'You cannot change your own role — ask another admin.' : roleHint}
        </p>
      </div>

      {errors.submit && <p className="text-sm text-danger">{errors.submit}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {isEdit ? 'Save Changes' : 'Create User'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">Cancel</Button>
      </div>
    </form>
  )
}

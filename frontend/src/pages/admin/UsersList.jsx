import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react'
import { userService, ROLES } from '@/services/userService'
import { useAuth } from '@/features/auth/AuthContext'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Badge from '@/components/ui/Badge'
import Table, { Pagination } from '@/components/ui/Table'
import { useAdminToast } from '@/components/layout/AdminLayout'
import UserForm from './UserForm'
import { formatDate, getInitials } from '@/utils/formatters'

export default function UsersList() {
  const toast = useAdminToast()
  const { user: me } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [roleFilter, setRoleFilter] = useState('')
  const [modal, setModal] = useState({ open: false, user: null })
  const [busy, setBusy] = useState(null)

  const load = () => {
    setLoading(true)
    const params = { page, size: 10 }
    if (roleFilter) params.role = roleFilter
    userService.list(params).then(setData).finally(() => setLoading(false))
  }

  useEffect(load, [page, roleFilter])

  const closeModal = () => setModal({ open: false, user: null })

  const handleDelete = async (row) => {
    if (!confirm(`Delete ${row.full_name}? This cannot be undone.`)) return
    setBusy(row.id)
    try {
      await userService.delete(row.id)
      toast.success('User deleted')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete')
    } finally { setBusy(null) }
  }

  const handleToggleActive = async (row) => {
    setBusy(row.id)
    try {
      await userService.update(row.id, { is_active: !row.is_active })
      toast.success(row.is_active ? 'User deactivated' : 'User activated')
      load()
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to update')
    } finally { setBusy(null) }
  }

  const columns = [
    {
      key: 'full_name', label: 'User',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-xs font-bold">{getInitials(row.full_name)}</span>
          </div>
          <div>
            <p className="font-medium text-text">
              {row.full_name}
              {row.id === me?.id && <span className="text-muted text-xs font-normal ml-2">(you)</span>}
            </p>
            <p className="text-muted text-xs mt-0.5">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'role', label: 'Role',
      render: (row) => (
        <Badge variant={row.role === 'admin' ? 'primary' : 'info'}>
          {row.role === 'admin' ? 'Admin' : 'Manager'}
        </Badge>
      )
    },
    {
      key: 'access', label: 'Access',
      render: (row) => (
        <span className="text-muted text-sm">
          {row.role === 'admin' ? 'Full panel' : 'Leads only'}
        </span>
      )
    },
    {
      key: 'is_active', label: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'default'}>
          {row.is_active ? 'Active' : 'Disabled'}
        </Badge>
      )
    },
    { key: 'created_at', label: 'Added', render: (row) => <span className="text-muted">{formatDate(row.created_at)}</span> },
    {
      key: 'actions', label: '', className: 'w-32',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setModal({ open: true, user: row })} title="Edit"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleToggleActive(row)} disabled={busy === row.id || row.id === me?.id}
            title={row.is_active ? 'Deactivate' : 'Activate'}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
            {row.is_active ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => handleDelete(row)} disabled={busy === row.id || row.id === me?.id}
            title="Delete"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors disabled:opacity-30 disabled:hover:bg-transparent">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Team</h1>
          <p className="text-muted mt-1">{data.total} panel users</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
            className="input-field w-40 text-sm">
            <option value="">All Roles</option>
            {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <Button onClick={() => setModal({ open: true, user: null })}>
            <Plus className="w-4 h-4" /> New User
          </Button>
        </div>
      </motion.div>

      <div className="card p-4 mb-6 flex items-start gap-3 bg-surface-2/50">
        <ShieldCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-muted text-sm">
          <span className="text-text font-medium">Managers</span> can only sign in to the Leads
          section — courses, teachers, certificates and this page stay admin-only.
        </p>
      </div>

      <div className="card p-6">
        <Table columns={columns} data={data.items} loading={loading} emptyText="No users yet." />
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      <Modal open={modal.open} onClose={closeModal}
        title={modal.user ? 'Edit User' : 'New User'}>
        <UserForm
          user={modal.user}
          onSuccess={() => {
            const wasEdit = !!modal.user
            closeModal()
            load()
            toast.success(wasEdit ? 'User updated' : 'User created')
          }}
          onCancel={closeModal}
        />
      </Modal>
    </div>
  )
}

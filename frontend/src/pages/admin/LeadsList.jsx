import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { leadService } from '@/services/leadService'
import { useAdminToast } from '@/components/layout/AdminLayout'
import Table, { Pagination } from '@/components/ui/Table'
import { StatusBadge } from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Select } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Input'
import { formatDateTime } from '@/utils/formatters'
import { formatPhone } from '@/utils/phone'
import { telegramLink } from '@/utils/telegram'
import { Trash2, SlidersHorizontal } from 'lucide-react'

const STATUSES = ['new', 'contacted', 'registered', 'rejected']

function StatusModal({ lead, onClose, onSave }) {
  const [status, setStatus] = useState(lead.status)
  const [notes, setNotes] = useState(lead.notes || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await onSave(status, notes)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card p-4 bg-surface-2 flex flex-col gap-1">
        <p className="text-text font-medium">{lead.name}</p>
        <a href={`tel:${lead.phone}`} className="text-muted text-sm hover:text-primary transition-colors w-fit">
          {formatPhone(lead.phone)}
        </a>
        {lead.telegram_username && (
          <a href={telegramLink(lead.telegram_username)} target="_blank" rel="noreferrer"
            className="text-muted text-sm hover:text-primary transition-colors w-fit">
            @{lead.telegram_username}
          </a>
        )}
        {lead.course_rel && <p className="text-primary text-sm">{lead.course_rel.title}</p>}
      </div>
      <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
        ))}
      </Select>
      <Textarea label="Notes (optional)" value={notes}
        onChange={(e) => setNotes(e.target.value)} placeholder="Add notes..." rows={3} />
      <div className="flex gap-3 pt-2">
        <Button onClick={handleSave} loading={loading} className="flex-1">Save</Button>
        <Button variant="secondary" onClick={onClose} className="flex-1">Cancel</Button>
      </div>
    </div>
  )
}

export default function LeadsList() {
  const toast = useAdminToast()
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    const params = { page, size: 15 }
    if (statusFilter) params.status = statusFilter
    leadService.list(params).then(setData).finally(() => setLoading(false))
  }

  useEffect(load, [page, statusFilter])

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    setDeleting(id)
    try {
      await leadService.delete(id)
      toast.success('Lead deleted')
      load()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const handleStatusSave = async (status, notes) => {
    try {
      await leadService.updateStatus(modal.id, status, notes)
      toast.success('Status updated')
      load()
    } catch { toast.error('Failed to update status') }
  }

  const columns = [
    {
      key: 'name', label: 'Lead',
      render: (row) => (
        <div>
          <p className="font-medium text-text">{row.name}</p>
          <p className="text-muted text-xs mt-0.5 font-mono">{formatPhone(row.phone)}</p>
          {row.telegram_username && (
            <p className="text-primary/70 text-xs mt-0.5">@{row.telegram_username}</p>
          )}
        </div>
      )
    },
    {
      key: 'course', label: 'Course',
      render: (row) => <span className="text-muted text-sm">{row.course_rel?.title || '—'}</span>
    },
    {
      key: 'status', label: 'Status',
      render: (row) => <StatusBadge status={row.status} />
    },
    {
      key: 'notes', label: 'Notes',
      render: (row) => <span className="text-muted text-sm line-clamp-1 max-w-xs">{row.notes || '—'}</span>
    },
    { key: 'created_at', label: 'Date', render: (row) => <span className="text-muted text-sm">{formatDateTime(row.created_at)}</span> },
    {
      key: 'actions', label: '', className: 'w-20',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setModal(row)}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row.id)} disabled={deleting === row.id}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
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
          <h1 className="page-title">Leads CRM</h1>
          <p className="text-muted mt-1">{data.total} total leads</p>
        </div>
        {/* Filter */}
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field w-44 text-sm">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </motion.div>

      <div className="card p-6">
        <Table columns={columns} data={data.items} loading={loading} emptyText="No leads yet." />
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title="Update Lead Status">
        {modal && (
          <StatusModal lead={modal} onClose={() => setModal(null)} onSave={handleStatusSave} />
        )}
      </Modal>
    </div>
  )
}

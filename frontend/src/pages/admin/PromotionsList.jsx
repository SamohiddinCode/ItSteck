import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Tag, Link2 } from 'lucide-react'
import { promotionService } from '@/services/promotionService'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'
import Table, { Pagination } from '@/components/ui/Table'
import { useAdminToast } from '@/components/layout/AdminLayout'
import PromotionForm from './PromotionForm'
import { formatDate } from '@/utils/formatters'

/** Why a promo is or isn't on the ticker — the schedule outranks the switch. */
const state = (row) => {
  if (row.is_live) return { variant: 'success', label: 'Live' }
  if (!row.is_active) return { variant: 'default', label: 'Off' }
  if (row.starts_at && new Date(row.starts_at) > new Date()) {
    return { variant: 'info', label: 'Scheduled' }
  }
  return { variant: 'warning', label: 'Expired' }
}

export default function PromotionsList() {
  const toast = useAdminToast()
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState({ open: false, promotion: null })
  const [deleting, setDeleting] = useState(null)

  const load = () => {
    setLoading(true)
    promotionService.list({ page, size: 10 })
      .then(setData)
      .finally(() => setLoading(false))
  }

  useEffect(load, [page])

  const handleDelete = async (id) => {
    if (!confirm('Delete this promo? It disappears from the ticker immediately.')) return
    setDeleting(id)
    try {
      await promotionService.delete(id)
      toast.success('Promo deleted')
      load()
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleting(null)
    }
  }

  const toggleActive = async (row) => {
    try {
      await promotionService.update(row.id, { is_active: !row.is_active })
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  const columns = [
    {
      key: 'text', label: 'Promo',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.discount
            ? <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-bold text-white flex-shrink-0">{row.discount}</span>
            : <Tag className="w-4 h-4 text-muted/40 flex-shrink-0" />}
          <div className="min-w-0">
            <p className="font-medium text-text line-clamp-1">{row.text}</p>
            {row.link_url && (
              <p className="text-muted text-xs mt-0.5 flex items-center gap-1">
                <Link2 className="w-3 h-3" /> {row.link_url}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'is_live', label: 'Status',
      render: (row) => {
        const s = state(row)
        return (
          <button onClick={() => toggleActive(row)} title="Click to switch on/off">
            <Badge variant={s.variant}>{s.label}</Badge>
          </button>
        )
      }
    },
    {
      key: 'window', label: 'Runs',
      render: (row) => (
        <span className="text-muted text-sm">
          {row.starts_at || row.ends_at
            ? `${formatDate(row.starts_at)} → ${formatDate(row.ends_at)}`
            : 'Always'}
        </span>
      )
    },
    { key: 'sort_order', label: 'Order', className: 'w-20', render: (row) => <span className="text-muted">{row.sort_order}</span> },
    {
      key: 'actions', label: '', className: 'w-24',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => setModal({ open: true, promotion: row })}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-text hover:bg-surface-2 transition-colors">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => handleDelete(row.id)} disabled={deleting === row.id}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )
    },
  ]

  const live = data.items.filter((p) => p.is_live).length

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Discounts Ticker</h1>
          <p className="text-muted mt-1">{data.total} promos · {live} live on this page</p>
        </div>
        <Button onClick={() => setModal({ open: true, promotion: null })}>
          <Plus className="w-4 h-4" /> New Promo
        </Button>
      </motion.div>

      <div className="card p-6">
        <Table columns={columns} data={data.items} loading={loading}
          emptyText="No promos yet — the ticker stays hidden until you add one." />
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, promotion: null })}
        size="lg" title={modal.promotion ? 'Edit Promo' : 'New Promo'}>
        <PromotionForm
          promotion={modal.promotion}
          onSuccess={() => {
            setModal({ open: false, promotion: null })
            load()
            toast.success(modal.promotion ? 'Promo updated' : 'Promo added')
          }}
          onCancel={() => setModal({ open: false, promotion: null })}
        />
      </Modal>
    </div>
  )
}

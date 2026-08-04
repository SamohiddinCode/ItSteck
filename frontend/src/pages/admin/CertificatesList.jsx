import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, FileText, Copy, Check, Search } from 'lucide-react'
import { certificateService } from '@/services/certificateService'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Table, { Pagination } from '@/components/ui/Table'
import { useAdminToast } from '@/components/layout/AdminLayout'
import CertificateForm from './CertificateForm'
import { formatDate } from '@/utils/formatters'

export default function CertificatesList() {
  const toast = useAdminToast()
  const [data, setData] = useState({ items: [], total: 0, pages: 0 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState({ open: false, certificate: null })
  const [deleting, setDeleting] = useState(null)
  const [copied, setCopied] = useState(null)

  const load = () => {
    setLoading(true)
    certificateService.list({ page, size: 10, search: query || undefined })
      .then(setData).finally(() => setLoading(false))
  }

  useEffect(load, [page, query])

  // Debounce the search box so typing doesn't hammer the API.
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); setQuery(search) }, 350)
    return () => clearTimeout(t)
  }, [search])

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate? The verification link will stop working.')) return
    setDeleting(id)
    try {
      await certificateService.delete(id)
      toast.success('Certificate deleted')
      load()
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(null) }
  }

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(code)
      setTimeout(() => setCopied(null), 1500)
    } catch { toast.error('Could not copy') }
  }

  const columns = [
    {
      key: 'student_name', label: 'Student',
      render: (row) => (
        <div>
          <p className="font-medium text-text">{row.student_name}</p>
          <p className="text-muted text-xs mt-0.5">{row.course_title}</p>
        </div>
      )
    },
    {
      key: 'code', label: 'Certificate No.',
      render: (row) => (
        <button onClick={() => copyCode(row.code)}
          className="group inline-flex items-center gap-1.5 font-mono text-xs text-primary hover:text-primary-hover transition-colors"
          title="Copy code">
          {row.code}
          {copied === row.code
            ? <Check className="w-3 h-3 text-success" />
            : <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </button>
      )
    },
    {
      key: 'subjects', label: 'Grades',
      render: (row) => (
        <span className="text-muted text-sm">
          {row.subjects?.length ? `${row.subjects.length} subject${row.subjects.length > 1 ? 's' : ''}` : '—'}
        </span>
      )
    },
    { key: 'issued_at', label: 'Issued', render: (row) => <span className="text-muted">{formatDate(row.issued_at)}</span> },
    {
      key: 'actions', label: '', className: 'w-32',
      render: (row) => (
        <div className="flex items-center gap-1">
          <a href={certificateService.pdfUrl(row.code)} target="_blank" rel="noreferrer"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-colors"
            title="Open PDF">
            <FileText className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => setModal({ open: true, certificate: row })}
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

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">Certificates</h1>
          <p className="text-muted mt-1">{data.total} issued</p>
        </div>
        <Button onClick={() => setModal({ open: true, certificate: null })}>
          <Plus className="w-4 h-4" /> New Certificate
        </Button>
      </motion.div>

      <div className="card p-6">
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-muted absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            className="input-field pl-11"
            placeholder="Search by student name or certificate number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Table columns={columns} data={data.items} loading={loading}
          emptyText={query ? 'No certificates match your search.' : 'No certificates issued yet.'} />
        <Pagination page={page} pages={data.pages} onPage={setPage} />
      </div>

      <Modal open={modal.open} onClose={() => setModal({ open: false, certificate: null })}
        size="lg" title={modal.certificate ? 'Edit Certificate' : 'New Certificate'}>
        <CertificateForm
          certificate={modal.certificate}
          onSuccess={(saved) => {
            setModal({ open: false, certificate: null })
            load()
            toast.success(
              modal.certificate ? 'Certificate updated' : `Certificate issued — ${saved.code}`
            )
          }}
          onCancel={() => setModal({ open: false, certificate: null })}
        />
      </Modal>
    </div>
  )
}

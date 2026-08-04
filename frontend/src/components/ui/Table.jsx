import clsx from 'clsx'
import Spinner from './Spinner'
import { useT } from '@/i18n'

export default function Table({ columns, data, loading, emptyText }) {
  const t = useT()
  const empty = emptyText ?? t('common.noRecords')

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th key={col.key} className={clsx('text-left text-muted font-medium py-3 px-4 first:pl-0 last:pr-0', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className="text-center py-16">
              <Spinner className="mx-auto" />
            </td></tr>
          ) : data.length === 0 ? (
            <tr><td colSpan={columns.length} className="text-center py-16 text-muted">{empty}</td></tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id ?? i} className="border-b border-border/50 hover:bg-surface-2/50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={clsx('py-4 px-4 first:pl-0 last:pr-0 text-text', col.cellClassName)}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

export function Pagination({ page, pages, onPage }) {
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-1 pt-6">
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPage(p)}
          className={clsx(
            'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
            p === page ? 'bg-primary text-white' : 'text-muted hover:text-text hover:bg-surface-2'
          )}
        >
          {p}
        </button>
      ))}
    </div>
  )
}

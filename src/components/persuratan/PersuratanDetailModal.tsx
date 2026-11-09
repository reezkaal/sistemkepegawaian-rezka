import type React from 'react'
import type { NaskahItem } from '@/types/persuratan'
import { formatTanggal } from '@/lib/utils'

interface Props {
  item: NaskahItem
  open: boolean
  onClose: () => void
}

export default function PersuratanDetailModal({ item, open, onClose }: Props) {
  if (!open) return null

  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') onClose()
  }

  const fields: Array<{ label: string; value: string | null | undefined }> = [
    { label: 'No. Urut', value: String(item.noUrut) },
    { label: 'Kelompok Naskah', value: item.kelompokNaskah },
    { label: 'Jenis Naskah', value: item.jenisNaskah },
    { label: 'Sifat Naskah', value: item.sifatNaskah },
    { label: 'Tanggal Naskah', value: item.tanggalNaskah ? formatTanggal(item.tanggalNaskah) : null },
    { label: 'Tanggal Diterima', value: item.tanggalDiterima ? formatTanggal(item.tanggalDiterima) : null },
    { label: 'Konseptor / OPR', value: item.konseptorOpr },
  ]

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Detail Naskah"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="relative w-full max-w-2xl rounded-t-xl border border-border bg-card shadow-lg sm:rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-base font-semibold text-foreground">Detail Naskah</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {/* Uraian Informasi — ditampilkan penuh di atas */}
          <div className="mb-5 rounded-lg border border-border bg-secondary/40 p-4">
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Uraian Informasi
            </p>
            <p className="text-sm leading-relaxed text-foreground">
              {item.uraianInformasi || <span className="text-muted-foreground">-</span>}
            </p>
          </div>

          {/* Field lain dalam grid */}
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            {fields.map(({ label, value }) => (
              <div key={label} className="min-w-0">
                <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 text-sm text-foreground">
                  {value || <span className="text-muted-foreground">-</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * CHECKPOINT A2/A3 — Halaman Detail Pegawai.
 *
 * Layout multi-section berdasarkan struktur DUK_Copy.xlsx:
 * 1. Header / Profil Pegawai
 * 2. Data Kepegawaian
 * 3. Data Pendidikan
 * 4. Data Pribadi
 * 5. Data Kontak & Administratif
 * 6. Ringkasan Cuti (N-2/N-1/N dari LeaveRecord — berasal dari DUK)
 *
 * CHECKPOINT A3: "Riwayat Cuti" (LeaveHistoryCard) dihapus — data
 * tersebut merupakan mock/contoh tanpa sumber di DUK_Copy.xlsx.
 * Aturan: field kosong/undefined → "-". Tidak ada data yang dikarang.
 */

import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import LeaveSummaryCard from '@/components/leave/LeaveSummaryCard'
import {
  SectionDataKepegawaian,
  SectionDataPendidikan,
  SectionDataPribadi,
  SectionDataKontakAdministratif,
} from '@/components/employee/EmployeeDetailSections'
import { useEmployeeDetail } from '@/hooks/useEmployeeDetail'
import { useLeaveSummary, TAHUN_BERJALAN } from '@/hooks/useLeaveSummary'

// ─── BackButton ───────────────────────────────────────────────────────────────

function BackButton() {
  const navigate = useNavigate()
  return (
    <Button type="button" variant="outline" onClick={() => navigate('/pegawai')}>
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      Kembali ke Daftar Pegawai
    </Button>
  )
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <BackButton />
      <Card>
        <CardContent className="space-y-3 p-6">
          <div className="h-6 w-48 animate-pulse rounded bg-accent" />
          <div className="h-4 w-32 animate-pulse rounded bg-accent" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-full max-w-sm animate-pulse rounded bg-accent" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── EmployeeDetail ───────────────────────────────────────────────────────────

export default function EmployeeDetail() {
  const { nip } = useParams<{ nip: string }>()
  const { employee, isLoading, error, notFound } = useEmployeeDetail(nip)
  const leaveSummary = useLeaveSummary(nip)

  if (isLoading) {
    return <LoadingSkeleton />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <BackButton />
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (notFound || !employee) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
            <User className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium text-foreground">Data pegawai tidak ditemukan.</p>
            <BackButton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Nama lengkap dengan gelar (jika tersedia)
  const gelarDepan = employee.gelarDepan?.trim() ?? ''
  const gelarBelakang = employee.gelarBelakang?.trim() ?? ''
  const namaLengkap = [gelarDepan, employee.nama, gelarBelakang]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="space-y-4">
      <BackButton />

      {/* ── 1. Header / Profil Pegawai ─────────────────────────────── */}
      <Card>
        <CardHeader className="flex flex-row items-start gap-4 space-y-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-soft">
            <User className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="leading-snug">{namaLengkap}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">NIP: {employee.nip}</p>
            {employee.jabatan && (
              <p className="mt-0.5 text-sm text-muted-foreground">{employee.jabatan}</p>
            )}
          </div>
          <Badge tone={employee.statusAktif ? 'success' : 'muted'}>
            {employee.statusKepegawaian}
          </Badge>
        </CardHeader>
      </Card>

      {/* ── 2. Data Kepegawaian ────────────────────────────────────── */}
      <SectionDataKepegawaian employee={employee} />

      {/* ── 3. Data Pendidikan ─────────────────────────────────────── */}
      <SectionDataPendidikan employee={employee} />

      {/* ── 4. Data Pribadi ────────────────────────────────────────── */}
      <SectionDataPribadi employee={employee} />

      {/* ── 5. Data Kontak & Administratif ────────────────────────── */}
      <SectionDataKontakAdministratif employee={employee} />

      {/* ── 6. Ringkasan Cuti N-2/N-1/N (dari LeaveRecord/DUK) ──────── */}
      {/*
        CHECKPOINT A3: hanya LeaveSummaryCard yang dipertahankan.
        "Riwayat Cuti" (LeaveHistoryCard) telah dihapus karena datanya
        merupakan mock tanpa sumber di DUK_Copy.xlsx.
      */}
      <LeaveSummaryCard
        record={leaveSummary.record}
        isLoading={leaveSummary.isLoading}
        error={leaveSummary.error}
        notFound={leaveSummary.notFound}
        tahunBerjalan={TAHUN_BERJALAN}
      />
    </div>
  )
}

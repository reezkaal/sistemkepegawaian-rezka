/**
 * Dashboard SIMPEG PPSDMPU — Modern Enterprise Government Dashboard
 * (Checkpoint 3D — Redesign).
 *
 * Hirarki visual:
 * - Header + subheading
 * - Section "Ringkasan": 4 StatCard (Total Pegawai, PNS, PPPK, Total Cuti)
 * - Strip Informasi Cepat: Pegawai Aktif, Pegawai Sedang Cuti
 * - Section "Distribusi Kepegawaian": Donut Status | Bar Golongan
 *                                     Bar Satker    | Bar Bidang/Bagian
 * - Section "Cuti & Pencarian": Ringkasan Cuti (N-2/N-1/N) | Donut Pendidikan
 *                                Cari Pegawai
 *
 * Semua angka diturunkan dari mockEmployees/mockLeaveRecords yang sudah
 * ada — tidak ada hardcode/angka fiktif. Warna solid, tanpa gradient
 * (CLAUDE.md § 4). Tidak mengubah routing, auth, atau halaman lain.
 */

import { Users, ShieldCheck, Briefcase, CalendarDays, UserCheck, CalendarClock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import StatCard, { StatCardSkeleton } from '@/components/dashboard/StatCard'
import EmployeeQuickSearch from '@/components/dashboard/EmployeeQuickSearch'
import StatusKepegawaianChart from '@/components/dashboard/StatusKepegawaianChart'
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart'
import PendidikanChart from '@/components/dashboard/PendidikanChart'
import CutiSummaryCard from '@/components/dashboard/CutiSummaryCard'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { useEmployeeCharts } from '@/hooks/useEmployeeCharts'

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div>
      <h2 className="text-[0.95rem] font-semibold tracking-tight text-foreground">{title}</h2>
      {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { summary, leaveYearSummary, isLoading: summaryLoading, error } = useDashboardSummary()
  const { data: chartData, isLoading: chartLoading } = useEmployeeCharts()

  // Transformer: tambah field `label` agar bisa dipakai HorizontalBarChart
  const golonganData = (chartData?.golongan ?? []).map((d) => ({ label: d.golongan, jumlah: d.jumlah }))
  const satkerData   = (chartData?.satker   ?? []).map((d) => ({ label: d.satker,   jumlah: d.jumlah }))
  const bidangData   = (chartData?.bidang   ?? []).map((d) => ({ label: d.bidang,   jumlah: d.jumlah }))

  return (
    <div className="space-y-6">
      {/* ── Judul halaman ────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan data kepegawaian PPSDMPU.
        </p>
      </div>

      {/* ── Error global ─────────────────────────────────────────── */}
      {error && (
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-sm text-destructive" role="alert">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* ── Section: Ringkasan (4 Stat Cards) ───────────────────── */}
      <section className="space-y-3">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryLoading || !summary ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard label="Total Pegawai" value={summary.totalPegawai} icon={Users} tone="violet" />
              <StatCard label="Pegawai PNS" value={summary.totalPNS} icon={ShieldCheck} tone="primary" />
              <StatCard label="Pegawai PPPK" value={summary.totalPPPK} icon={Briefcase} tone="success" />
              <StatCard
                label="Total Cuti (contoh)"
                value={summary.totalCuti}
                icon={CalendarDays}
                tone="warning"
                hint="Rekap jenis cuti — data contoh"
              />
            </>
          )}
        </div>

        {/* ── Strip Informasi Cepat ─────────────────────────────── */}
        {!summaryLoading && summary && (
          <Card>
            <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
                  <UserCheck className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{summary.pegawaiAktif}</span>{' '}
                  <span className="text-muted-foreground">pegawai aktif</span>
                </p>
              </div>
              <div className="hidden h-6 w-px bg-border sm:block" />
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                </div>
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{summary.pegawaiSedangCuti}</span>{' '}
                  <span className="text-muted-foreground">pegawai sedang cuti</span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </section>

      {/* ── Section: Distribusi Kepegawaian ─────────────────────── */}
      <section className="space-y-3">
        <SectionHeading
          title="Distribusi Kepegawaian"
          description="Sebaran pegawai berdasarkan status, golongan, satuan kerja, dan bidang/bagian"
        />

        {/* Donut Status Kepegawaian + Bar Golongan */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <StatusKepegawaianChart
              data={chartData?.statusKepegawaian ?? []}
              isLoading={chartLoading}
            />
          </div>
          <div className="lg:col-span-2">
            <HorizontalBarChart
              title="Distribusi Golongan"
              description="Jumlah pegawai per golongan, diurutkan terbesar"
              data={golonganData}
              isLoading={chartLoading}
            />
          </div>
        </div>

        {/* Bar Satker + Bar Bidang/Bagian */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <HorizontalBarChart
            title="Distribusi Satker"
            description="Jumlah pegawai per satuan kerja"
            data={satkerData}
            isLoading={chartLoading}
          />
          <HorizontalBarChart
            title="Distribusi Bidang/Bagian"
            description="Jumlah pegawai per bidang atau bagian"
            data={bidangData}
            isLoading={chartLoading}
          />
        </div>
      </section>

      {/* ── Section: Cuti, Pendidikan & Pencarian ───────────────── */}
      <section className="space-y-3">
        <SectionHeading title="Cuti & Informasi Lainnya" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CutiSummaryCard
            data={leaveYearSummary}
            isLoading={summaryLoading}
            error={error}
          />
          <PendidikanChart
            data={chartData?.pendidikan ?? []}
            isLoading={chartLoading}
          />
        </div>
        <EmployeeQuickSearch />
      </section>
    </div>
  )
}

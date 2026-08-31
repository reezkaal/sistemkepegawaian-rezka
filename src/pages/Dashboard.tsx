/**
 * Dashboard SIMPEG PPSDMPU — Redesign Enterprise.
 *
 * Semua angka diturunkan dari data aktual GAS/Spreadsheet.
 * Tidak ada mock data, tidak ada statusAktif, tidak ada pegawai sedang cuti hardcoded.
 *
 * 7 Zone layout:
 * Zone 1: Page header
 * Zone 2: KPI — Total / PNS / PPPK / Belum Terisi
 * Zone 3: Golongan — full-width vertical bar chart
 * Zone 4: Demografi — Usia + Gender
 * Zone 5: Status & Organisasi — Status + Satker + Bidang/Bagian
 * Zone 6: Pendidikan — full-width
 * Zone 7: Tools — Cuti + Cari Pegawai
 *
 * Palet warna chart:
 *   Navy/primary → identitas
 *   Amber        → Golongan
 *   Violet       → Usia
 *   Teal         → Organisasi (Satker, Bidang)
 *   Primary/biru  → Status PNS
 *   Success/green → Status PPPK
 *   Indigo       → Pendidikan
 *   Gray/muted   → Belum Terisi (semua chart)
 */

import { Users, ShieldCheck, Briefcase, HelpCircle } from 'lucide-react'
import StatCard, { StatCardSkeleton } from '@/components/dashboard/StatCard'
import EmployeeQuickSearch from '@/components/dashboard/EmployeeQuickSearch'
import StatusKepegawaianChart from '@/components/dashboard/StatusKepegawaianChart'
import HorizontalBarChart from '@/components/dashboard/HorizontalBarChart'
import PendidikanChart from '@/components/dashboard/PendidikanChart'
import CutiSummaryCard from '@/components/dashboard/CutiSummaryCard'
import GenderChart from '@/components/dashboard/GenderChart'
import UsiaChart from '@/components/dashboard/UsiaChart'
import GolonganChart from '@/components/dashboard/GolonganChart'
import { useDashboardSummary } from '@/hooks/useDashboardSummary'
import { useEmployeeCharts } from '@/hooks/useEmployeeCharts'

function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border-l-2 border-primary/50 pl-3">
      <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { summary, leaveYearSummary, isLoading: summaryLoading, error } = useDashboardSummary()
  const { data: chartData, isLoading: chartLoading } = useEmployeeCharts()

  // Data chart — dari service, tidak ada filter/limit di sini
  const golonganData = chartData?.golongan ?? []
  const satkerData   = (chartData?.satker   ?? []).map((d) => ({ label: d.satker,   jumlah: d.jumlah }))
  const bidangData   = (chartData?.bidang   ?? []).map((d) => ({ label: d.bidang,   jumlah: d.jumlah }))

  // Satker & Bidang/Bagian berbagi SATU tinggi chart (berdasarkan kategori
  // terbanyak di antara keduanya) supaya kedua card sejajar dalam satu row
  // — bukan salah satu jadi lebih tinggi hanya karena kategorinya lebih
  // banyak. Kategori yang lebih sedikit tetap memakai ruang yang sama
  // secara efisien (bar sedikit lebih renggang), bukan card yang menciut.
  // Dibatasi dengan MAX_ORG_CHART_HEIGHT supaya card Status Kepegawaian di
  // row yang sama tidak ikut dipaksa sangat tinggi hanya karena salah satu
  // dari Satker/Bidang punya banyak kategori — bar jadi sedikit lebih rapat
  // (bukan card yang meninggi tanpa batas) saat kategori sangat banyak.
  const MAX_ORG_CHART_HEIGHT = 320
  const orgChartHeight = Math.min(
    Math.max(satkerData.length, bidangData.length, 3) * 34 + 40,
    MAX_ORG_CHART_HEIGHT,
  )

  // KPI Belum Terisi = sisa dari total yang bukan PNS/PPPK
  const belumTerisi = summary
    ? Math.max(0, summary.totalPegawai - summary.totalPNS - summary.totalPPPK)
    : 0

  return (
    <div className="space-y-6">
      {/* ── Zone 1: Page Header ─────────────────────────────────── */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Data Kepegawaian
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          PPSDMPU — Pusat Pengembangan Sumber Daya Manusia Perhubungan Udara
        </p>
      </div>

      {/* ── Error global ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
        </div>
      )}

      {/* ── Zone 2: KPI Row — 4 cards ─────────────────────────────── */}
      <section aria-label="Ringkasan kepegawaian">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {summaryLoading || !summary ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Pegawai"
                value={summary.totalPegawai}
                icon={Users}
                tone="violet"
              />
              <StatCard
                label="PNS"
                value={summary.totalPNS}
                icon={ShieldCheck}
                tone="primary"
              />
              <StatCard
                label="PPPK"
                value={summary.totalPPPK}
                icon={Briefcase}
                tone="success"
              />
              <StatCard
                label="Belum Terisi"
                value={belumTerisi}
                icon={HelpCircle}
                tone="amber"
                hint="Status belum terisi di spreadsheet"
              />
            </>
          )}
        </div>
      </section>

      {/* ── Zone 3: Golongan — full-width ─────────────────────────── */}
      <section className="space-y-3" aria-label="Distribusi golongan">
        <SectionHeading
          title="Distribusi Golongan"
          description="Seluruh kategori golongan aktual dari spreadsheet DUK"
        />
        <GolonganChart
          data={golonganData}
          isLoading={chartLoading}
        />
      </section>

      {/* ── Zone 4: Demografi — Usia + Gender ────────────────────── */}
      <section className="space-y-3" aria-label="Demografi pegawai">
        <SectionHeading
          title="Demografi"
          description="Distribusi usia dan gender pegawai"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-5">
          <div className="h-full lg:col-span-3">
            <UsiaChart
              data={chartData?.usia ?? []}
              isLoading={chartLoading}
              dataValid={chartData?.usiaDataValid ?? 0}
              totalPegawai={chartData?.totalPegawai ?? 0}
            />
          </div>
          <div className="h-full lg:col-span-2">
            <GenderChart
              data={chartData?.gender ?? []}
              isLoading={chartLoading}
              totalPegawai={chartData?.totalPegawai ?? 0}
            />
          </div>
        </div>
      </section>

      {/* ── Zone 5: Status & Organisasi ───────────────────────────── */}
      <section className="space-y-3" aria-label="Status dan unit kerja">
        <SectionHeading
          title="Status & Unit Kerja"
          description="Status kepegawaian, satuan kerja, dan bidang/bagian"
        />
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-3">
          <div className="h-full lg:col-span-1">
            <StatusKepegawaianChart
              data={chartData?.statusKepegawaian ?? []}
              isLoading={chartLoading}
            />
          </div>
          <div className="h-full lg:col-span-1">
            <HorizontalBarChart
              title="Distribusi Satker"
              description="Jumlah pegawai per satuan kerja"
              data={satkerData}
              isLoading={chartLoading}
              barColor="hsl(var(--teal))"
              height={orgChartHeight}
            />
          </div>
          <div className="h-full lg:col-span-1">
            <HorizontalBarChart
              title="Distribusi Bidang/Bagian"
              description="Jumlah pegawai per bidang atau bagian"
              data={bidangData}
              isLoading={chartLoading}
              barColor="hsl(var(--teal))"
              height={orgChartHeight}
            />
          </div>
        </div>
      </section>

      {/* ── Zone 6: Pendidikan — full-width ───────────────────────── */}
      <section className="space-y-3" aria-label="Pendidikan pegawai">
        <SectionHeading
          title="Pendidikan"
          description="Tingkat pendidikan terakhir pegawai"
        />
        <PendidikanChart
          data={chartData?.pendidikan ?? []}
          isLoading={chartLoading}
          totalPegawai={chartData?.totalPegawai}
        />
      </section>

      {/* ── Zone 7: Tools — Cuti + Cari Pegawai ──────────────────── */}
      <section className="space-y-3" aria-label="Cuti dan pencarian">
        <SectionHeading title="Cuti & Pencarian" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <CutiSummaryCard
            data={leaveYearSummary}
            isLoading={summaryLoading}
            error={error}
          />
          <EmployeeQuickSearch />
        </div>
      </section>
    </div>
  )
}

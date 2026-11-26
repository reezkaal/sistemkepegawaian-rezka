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

import { Link } from 'react-router-dom'
import { Users, ShieldCheck, Briefcase, CalendarDays, FileText, Calendar, ArrowUpRight } from 'lucide-react'
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
import { useAuth } from '@/hooks/useAuth'

function getGreetingWIB(): string {
  const hourStr = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    hour: 'numeric',
    hour12: false,
  }).format(new Date())
  const hour = parseInt(hourStr, 10)
  if (hour >= 4 && hour < 11) return 'Selamat Pagi'
  if (hour >= 11 && hour < 15) return 'Selamat Siang'
  if (hour >= 15 && hour < 18) return 'Selamat Sore'
  return 'Selamat Malam'
}

function formatTodayWIB(): string {
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'Asia/Jakarta',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())
}

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
  const { user, role } = useAuth()
  const { summary, leaveYearSummary, isLoading: summaryLoading, error } = useDashboardSummary()
  const { data: chartData, isLoading: chartLoading } = useEmployeeCharts()

  const canAccessAdmin = role === 'superadmin' || role === 'admin'
  const greeting = getGreetingWIB()
  const todayLabel = formatTodayWIB()
  const displayName = user?.displayName?.trim() || 'Pengguna'

  // Data chart — dari service, tidak ada filter/limit di sini
  const golonganData = chartData?.golongan ?? []
  const satkerData = (chartData?.satker ?? []).map((d) => ({ label: d.satker, jumlah: d.jumlah }))
  const bidangData = (chartData?.bidang ?? []).map((d) => ({ label: d.bidang, jumlah: d.jumlah }))

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

  return (
    <div className="space-y-6">
      {/* ── Zone 1: Hero — Personal Greeting + Glass Quick Bar ───── */}
      <section
        aria-label="Sambutan dan akses cepat"
        className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/85 bg-gradient-to-br from-primary/[0.07] via-transparent to-cyan/[0.06] p-5 shadow-card backdrop-blur-md dark:bg-card/70 dark:from-primary/[0.14] dark:to-violet/[0.10] sm:p-6"
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-primary">
              {greeting}, {displayName}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Data Kepegawaian
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              PPSDMPU - Pusat Pengembangan SDM Perhubungan Udara
            </p>
          </div>

          <div className="flex flex-col items-start gap-2.5 lg:items-end">
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              <span>{todayLabel}</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-border/80 bg-background/65 p-1.5 shadow-sm backdrop-blur-md dark:bg-background/45">
              {canAccessAdmin && (
                <Link
                  to="/pegawai"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                >
                  <Users className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Pegawai</span>
                  <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
                </Link>
              )}
              <Link
                to="/cuti"
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
              >
                <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Cuti</span>
                <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
              </Link>
              {canAccessAdmin && (
                <Link
                  to="/persuratan"
                  className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-foreground transition-all hover:bg-primary hover:text-primary-foreground active:scale-[0.98]"
                >
                  <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Persuratan</span>
                  <ArrowUpRight className="h-3 w-3 opacity-70" aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Error global ──────────────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
          <p className="text-sm text-destructive" role="alert">{error}</p>
        </div>
      )}

      {/* ── Zone 2: KPI Row — 3 cards ─────────────────────────────── */}
      <section aria-label="Ringkasan kepegawaian">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {summaryLoading || !summary ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Total Pegawai Aktif"
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
            </>
          )}
        </div>
      </section>

      {/* ── Zone 3: Golongan — full-width ─────────────────────────── */}
      <section className="space-y-3" aria-label="Distribusi golongan">
        <SectionHeading
          title="Distribusi Golongan"
          description="Jumlah pegawai per golongan dan pangkat"
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
        <SectionHeading
          title="Cuti & Pencarian"
          description="Ringkasan cuti tahunan dan pencarian cepat pegawai"
        />
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

import type { Employee, EmployeeListItem } from '@/types/employee'
import type { LeaveRecord, LeaveHistoryEntry } from '@/types/leave'
import type {
  DashboardSummary,
  LeaveTypeSummaryItem,
  EmployeeChartData,
  LeaveYearAggregate,
} from '@/types/dashboard'
import { mockEmployees } from '@/mock/employees'
import { mockLeaveRecords, mockLeaveTypeSummary, mockNipSedangCuti, mockLeaveHistory } from '@/mock/leave'
import { getRemoteEmployees, getRemoteLeaveRecords } from '@/services/remoteDataSource'

/**
 * Service layer terpusat untuk semua akses data.
 *
 * Sumber data ditentukan oleh env var `VITE_DATA_SOURCE` ('mock' —
 * default, atau 'remote' untuk Google Apps Script - lihat
 * docs/spreadsheet-integration.md). SEMUA fungsi yang diekspor di
 * bawah TIDAK berubah signature/perilakunya terhadap pemanggilnya
 * (hook) terlepas dari sumber data - hook/komponen tidak perlu tahu
 * atau berubah sama sekali.
 *
 * `getLeaveHistory`/`getLeaveHistoryByNip`/`getLeaveTypeSummary` TETAP
 * mock (lihat docs/spreadsheet-integration.md § 5) - tidak ada kolom
 * sumber di spreadsheet untuk data ini, dan sudah tidak dipakai UI
 * manapun sejak Checkpoint A3.
 *
 * Jangan melakukan fetch langsung dari component - selalu lewat sini.
 */

const DATA_SOURCE: 'mock' | 'remote' = import.meta.env.VITE_DATA_SOURCE === 'remote' ? 'remote' : 'mock'

const SIMULATED_DELAY_MS = 300

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS))
}

/**
 * In-memory promise deduplication untuk mode remote.
 * Jika ada fetch yang sedang berjalan, caller berikutnya menunggu promise
 * yang sama — tidak membuat HTTP request baru. Cache hilang saat refresh
 * sehingga data selalu fresh setelah spreadsheet diedit dan disimpan.
 */
let _employeesPromise: Promise<Employee[]> | null = null
let _leaveRecordsPromise: Promise<LeaveRecord[]> | null = null

/** Raw accessor - satu-satunya tempat yang tahu apakah data dari mock atau remote. */
function getRawEmployees(): Promise<Employee[]> {
  if (DATA_SOURCE !== 'remote') return delay(mockEmployees)
  if (_employeesPromise !== null) return _employeesPromise
  _employeesPromise = getRemoteEmployees().catch((err: unknown) => {
    _employeesPromise = null
    return Promise.reject(err)
  })
  return _employeesPromise
}

/** Raw accessor - satu-satunya tempat yang tahu apakah data dari mock atau remote. */
function getRawLeaveRecords(): Promise<LeaveRecord[]> {
  if (DATA_SOURCE !== 'remote') return delay(mockLeaveRecords)
  if (_leaveRecordsPromise !== null) return _leaveRecordsPromise
  _leaveRecordsPromise = getRemoteLeaveRecords().catch((err: unknown) => {
    _leaveRecordsPromise = null
    return Promise.reject(err)
  })
  return _leaveRecordsPromise
}

function toEmployeeListItem(e: Employee): EmployeeListItem {
  return {
    nip: e.nip,
    nama: e.nama,
    jabatan: e.jabatan,
    golongan: e.golongan,
    satker: e.satuanKerja,
    bidangBagian: e.bidangBagian,
    statusKepegawaian: e.statusKepegawaian,
  }
}

export async function getEmployees(): Promise<EmployeeListItem[]> {
  const employees = await getRawEmployees()
  return employees.map(toEmployeeListItem)
}

/**
 * Pencarian pegawai berdasarkan nama atau NIP (case-insensitive).
 * Dipakai oleh Quick Search di Dashboard (Checkpoint 3A).
 */
export async function searchEmployees(query: string): Promise<EmployeeListItem[]> {
  const keyword = query.trim().toLowerCase()
  if (!keyword) return []

  const employees = await getRawEmployees()
  const results = employees.filter(
    (e) => e.nama.toLowerCase().includes(keyword) || e.nip.toLowerCase().includes(keyword),
  )

  return results.map(toEmployeeListItem)
}

export async function getEmployeeByNip(nip: string): Promise<Employee | undefined> {
  const employees = await getRawEmployees()
  return employees.find((e) => e.nip === nip)
}

export async function getLeaveData(): Promise<LeaveRecord[]> {
  return getRawLeaveRecords()
}

/**
 * Seluruh data Nilai Cuti Tahunan (N-2/N-1/N) semua pegawai.
 * Dipakai oleh halaman `/cuti` (Checkpoint A3).
 * Struktur dari sheet "NILAI CUTI TAHUNAN - AWAL TAHUN" di DUK_Copy.xlsx.
 */
export async function getLeaveRecords(): Promise<LeaveRecord[]> {
  return getRawLeaveRecords()
}

/**
 * Ringkasan nilai tahunan cuti (N-2/N-1/N) untuk satu pegawai.
 * Dipakai oleh "Ringkasan Cuti" di Detail Pegawai (Checkpoint 3C).
 * Mengembalikan undefined jika belum ada data untuk NIP tersebut -
 * komponen pemanggil wajib menangani kondisi ini (lihat § 5 CLAUDE.md
 * & docs/data-mapping.md § 6).
 */
export async function getLeaveSummaryByNip(nip: string): Promise<LeaveRecord | undefined> {
  const records = await getRawLeaveRecords()
  return records.find((r) => r.nip === nip)
}

/**
 * Seluruh riwayat pengajuan cuti (semua pegawai), untuk halaman `/cuti`
 * (Checkpoint 3C).
 */
export async function getLeaveHistory(): Promise<LeaveHistoryEntry[]> {
  return delay(mockLeaveHistory)
}

/**
 * Riwayat pengajuan cuti milik satu pegawai, untuk bagian "Riwayat
 * Cuti" di Detail Pegawai (Checkpoint 3C). Array kosong berarti belum
 * ada riwayat - komponen pemanggil menampilkan pesan yang sesuai.
 */
export async function getLeaveHistoryByNip(nip: string): Promise<LeaveHistoryEntry[]> {
  return delay(mockLeaveHistory.filter((entry) => entry.nip === nip))
}

/**
 * Ringkasan statistik untuk kartu Dashboard (Checkpoint 3A, diperluas
 * Checkpoint 3D): Total Pegawai, Pegawai PNS, Pegawai PPPK, Total Cuti,
 * ditambah Pegawai Aktif & Pegawai Sedang Cuti untuk section Informasi
 * Cepat. totalPNS/totalPPPK dihitung dari `Employee.statusKepegawaian`
 * yang sudah ada — bukan data atau struktur baru.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const employees = await getRawEmployees()
  const totalPegawai = employees.length
  const pegawaiAktif = employees.filter((e) => e.statusAktif).length
  const pegawaiSedangCuti = mockNipSedangCuti.length
  const totalCuti = mockLeaveTypeSummary.reduce((sum, item) => sum + item.jumlah, 0)
  const totalPNS = employees.filter((e) => e.statusKepegawaian === 'PNS').length
  const totalPPPK = employees.filter((e) => e.statusKepegawaian === 'PPPK').length

  return {
    totalPegawai,
    pegawaiAktif,
    pegawaiSedangCuti,
    totalCuti,
    totalPNS,
    totalPPPK,
  }
}

/**
 * Agregat N-2/N-1/N untuk satu tahun, dijumlahkan lintas pegawai yang
 * memiliki data (`LeaveRecord.nilaiTahunan`) untuk tahun tersebut.
 * Dipakai oleh section "Ringkasan Cuti" di Dashboard (Checkpoint 3D).
 * Nilai `undefined` per pegawai diabaikan dari penjumlahan (dianggap
 * "belum tercatat", bukan 0) — konsisten dengan `LeaveYearTable` &
 * `LeaveSummaryCard` yang menampilkan "-" untuk nilai undefined.
 */
export async function getLeaveYearAggregate(tahun: number): Promise<LeaveYearAggregate> {
  const records = await getRawLeaveRecords()

  let totalNMinus2 = 0
  let totalNMinus1 = 0
  let totalN = 0
  let jumlahPegawaiTercatat = 0

  for (const record of records) {
    const yearValue = record.nilaiTahunan.find((v) => v.tahun === tahun)
    if (!yearValue) continue
    const hasAnyValue =
      yearValue.nMinus2 !== undefined || yearValue.nMinus1 !== undefined || yearValue.n !== undefined
    if (!hasAnyValue) continue

    jumlahPegawaiTercatat += 1
    totalNMinus2 += yearValue.nMinus2 ?? 0
    totalNMinus1 += yearValue.nMinus1 ?? 0
    totalN += yearValue.n ?? 0
  }

  return { tahun, totalNMinus2, totalNMinus1, totalN, jumlahPegawaiTercatat }
}

/**
 * Data untuk chart "Rekap Cuti Berdasarkan Jenis" di Dashboard.
 */
export async function getLeaveTypeSummary(): Promise<LeaveTypeSummaryItem[]> {
  return delay(mockLeaveTypeSummary)
}

/**
 * Data untuk 5 chart analitik kepegawaian di Dashboard (Style Charts update).
 * Semua dihitung secara dinamis dari data mentah (mock ATAU remote,
 * lihat getRawEmployees) — tidak ada hardcode angka.
 * Distribusi: Status Kepegawaian, Golongan, Satker, Bidang/Bagian, Pendidikan.
 */
export async function getEmployeeChartData(): Promise<EmployeeChartData> {
  const employees = await getRawEmployees()
  const total = employees.length

  // Helper: hitung frekuensi dari array nilai string
  function countBy(fn: (e: Employee) => string | undefined): Record<string, number> {
    const counts: Record<string, number> = {}
    for (const e of employees) {
      const key = fn(e)?.trim() || '-'
      counts[key] = (counts[key] ?? 0) + 1
    }
    return counts
  }

  // 1. Status Kepegawaian (PNS / PPPK)
  const statusCounts = countBy((e) => e.statusKepegawaian)
  const statusKepegawaian = Object.entries(statusCounts)
    .map(([status, jumlah]) => ({
      status,
      jumlah,
      persentase: Math.round((jumlah / total) * 100),
    }))
    .sort((a, b) => b.jumlah - a.jumlah)

  // 2. Golongan — sorted descending
  const golonganCounts = countBy((e) => e.golongan)
  const golongan = Object.entries(golonganCounts)
    .map(([golongan, jumlah]) => ({ golongan, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)

  // 3. Satker — sorted descending
  const satkerCounts = countBy((e) => e.satuanKerja)
  const satker = Object.entries(satkerCounts)
    .map(([satker, jumlah]) => ({ satker, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)

  // 4. Bidang/Bagian — sorted descending
  const bidangCounts = countBy((e) => e.bidangBagian)
  const bidang = Object.entries(bidangCounts)
    .map(([bidang, jumlah]) => ({ bidang, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)

  // 5. Pendidikan Terakhir — sorted descending
  const pendidikanCounts = countBy((e) => e.tingkatPendidikan ?? e.pendidikanTerakhir)
  const pendidikan = Object.entries(pendidikanCounts)
    .map(([tingkat, jumlah]) => ({
      tingkat,
      jumlah,
      persentase: Math.round((jumlah / total) * 100),
    }))
    .sort((a, b) => b.jumlah - a.jumlah)

  return { statusKepegawaian, golongan, satker, bidang, pendidikan }
}

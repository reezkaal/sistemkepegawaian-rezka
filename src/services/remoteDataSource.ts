import type { Employee, JenisKelamin, StatusKepegawaian } from '@/types/employee'
import type { LeaveRecord, LeaveYearValue } from '@/types/leave'

/**
 * Data source REMOTE — lihat kontrak JSON lengkap di
 * docs/spreadsheet-integration.md.
 *
 * File ini TIDAK dipakai kecuali `VITE_DATA_SOURCE=remote` (lihat
 * services/api.ts). Selama env var itu tidak diisi, aplikasi tetap
 * memakai mock data seperti sebelumnya — tidak ada perubahan perilaku.
 *
 * ARSITEKTUR (setelah migrasi proxy):
 * Frontend memanggil endpoint Vercel Serverless (/api/employees,
 * /api/leave). Vercel Function membaca GOOGLE_APPS_SCRIPT_URL dari
 * environment variable SERVER-SIDE dan meneruskan request ke GAS.
 * URL GAS tidak pernah ada di JavaScript bundle yang dikirim ke browser.
 *
 * OPTIMASI PERFORMA:
 * In-memory promise deduplication: jika ada fetch sedang berjalan,
 * request berikutnya akan menunggu promise yang sama (bukan buat request
 * baru). Cache ini hilang saat tab di-refresh sehingga data selalu fresh.
 */

interface RemoteEmployeeRow {
  nama: string
  nip: string
  golongan?: string
  tmtGolongan?: string
  pendidikanPengangkatan?: string
  tmtPengangkatan?: string
  tmtJabatan?: string
  jabatan?: string
  kelasJabatan?: string
  eselon?: string
  status: string
  satker: string
  bidangBagian?: string
  subBagian?: string
  nomorAbsensi?: string
  jenisKelamin?: string
  tempatLahir?: string
  tanggalLahir?: string
  agama?: string
  gelarDepan?: string
  gelarBelakang?: string
  tingkatPendidikan?: string
  tahunLulus?: string
  institusiPendidikan?: string
  jurusan?: string
  alamat?: string
  emailPribadi?: string
  emailDinas?: string
  idBkn?: string
  kerpeg?: string
  nik?: string
  noHp?: string
  namaRekening?: string
  noRekening?: string
  bank?: string
  npwp?: string
  statusAktif?: boolean
}

interface RemoteLeaveYearRow {
  nip: string
  nama: string
  unitKerja?: string
  tahun: number
  nMinus2?: number
  nMinus1?: number
  n?: number
}

/**
 * In-memory promise cache per session tab — hilang saat refresh.
 * Mencegah multiple HTTP request paralel untuk data yang sama.
 */
let pendingEmployeesRequest: Promise<RemoteEmployeeRow[]> | null = null
let pendingLeaveRequest: Promise<RemoteLeaveYearRow[]> | null = null

/**
 * Fetch /api/employees — Vercel serverless proxy ke GAS.
 * Path relatif agar berfungsi di semua environment (Vercel production,
 * vercel dev, maupun Vite dev proxy).
 */
function fetchEmployees(): Promise<RemoteEmployeeRow[]> {
  if (pendingEmployeesRequest !== null) return pendingEmployeesRequest

  pendingEmployeesRequest = fetch('/api/employees')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Gagal mengambil data pegawai (HTTP ${response.status}).`)
      }
      return response.json() as Promise<RemoteEmployeeRow[]>
    })
    .catch((err: unknown) => {
      pendingEmployeesRequest = null
      throw err
    })

  return pendingEmployeesRequest
}

/**
 * Fetch /api/leave — Vercel serverless proxy ke GAS.
 */
function fetchLeave(): Promise<RemoteLeaveYearRow[]> {
  if (pendingLeaveRequest !== null) return pendingLeaveRequest

  pendingLeaveRequest = fetch('/api/leave')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Gagal mengambil data cuti (HTTP ${response.status}).`)
      }
      return response.json() as Promise<RemoteLeaveYearRow[]>
    })
    .catch((err: unknown) => {
      pendingLeaveRequest = null
      throw err
    })

  return pendingLeaveRequest
}

function toJenisKelamin(value: string | undefined): JenisKelamin | undefined {
  if (value === 'L' || value === 'P') return value
  return undefined
}

function mapRowToEmployee(row: RemoteEmployeeRow): Employee {
  return {
    nip: row.nip,
    nama: row.nama,
    golongan: row.golongan,
    tmtGolongan: row.tmtGolongan,
    pendidikanPengangkatan: row.pendidikanPengangkatan,
    tmtPengangkatan: row.tmtPengangkatan,
    tmtJabatan: row.tmtJabatan,
    jabatan: row.jabatan,
    kelasJabatan: row.kelasJabatan,
    eselon: row.eselon,
    statusKepegawaian: row.status as StatusKepegawaian,
    satuanKerja: row.satker,
    bidangBagian: row.bidangBagian,
    subBagian: row.subBagian,
    nomorAbsensi: row.nomorAbsensi,
    jenisKelamin: toJenisKelamin(row.jenisKelamin),
    tempatLahir: row.tempatLahir,
    tanggalLahir: row.tanggalLahir,
    agama: row.agama,
    gelarDepan: row.gelarDepan,
    gelarBelakang: row.gelarBelakang,
    tingkatPendidikan: row.tingkatPendidikan,
    tahunLulus: row.tahunLulus,
    institusiPendidikan: row.institusiPendidikan,
    jurusan: row.jurusan,
    alamat: row.alamat,
    emailPribadi: row.emailPribadi,
    emailDinas: row.emailDinas,
    idBkn: row.idBkn,
    kerpeg: row.kerpeg,
    nik: row.nik,
    noHp: row.noHp,
    namaRekening: row.namaRekening,
    noRekening: row.noRekening,
    bank: row.bank,
    npwp: row.npwp,
    statusAktif: row.statusAktif ?? true,
  }
}

export async function getRemoteEmployees(): Promise<Employee[]> {
  const employees = await fetchEmployees()
  return employees.map(mapRowToEmployee)
}

/**
 * Mengelompokkan baris panjang (long format, satu baris per pegawai per
 * tahun) dari Apps Script menjadi LeaveRecord[] (satu record per
 * pegawai dengan array nilaiTahunan) - bentuk yang sama persis dengan
 * yang sudah dipakai mock data, supaya tidak ada perubahan di
 * hook/komponen manapun.
 */
export async function getRemoteLeaveRecords(): Promise<LeaveRecord[]> {
  const rows = await fetchLeave()

  const byNip = new Map<string, LeaveRecord>()
  for (const row of rows) {
    const yearValue: LeaveYearValue = {
      tahun: row.tahun,
      nMinus2: row.nMinus2,
      nMinus1: row.nMinus1,
      n: row.n,
    }

    const existing = byNip.get(row.nip)
    if (existing) {
      existing.nilaiTahunan.push(yearValue)
      continue
    }

    byNip.set(row.nip, {
      nip: row.nip,
      nama: row.nama,
      unitKerja: row.unitKerja ?? '',
      nilaiTahunan: [yearValue],
    })
  }

  return Array.from(byNip.values())
}

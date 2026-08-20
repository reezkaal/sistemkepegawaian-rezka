import type { Employee, JenisKelamin, StatusKepegawaian } from '@/types/employee'
import type { LeaveRecord, LeaveYearValue } from '@/types/leave'

/**
 * Data source REMOTE (Google Apps Script Web App) — lihat kontrak JSON
 * lengkap di docs/spreadsheet-integration.md.
 *
 * File ini TIDAK dipakai kecuali `VITE_DATA_SOURCE=remote` (lihat
 * services/api.ts). Selama env var itu tidak diisi, aplikasi tetap
 * memakai mock data seperti sebelumnya — tidak ada perubahan perilaku.
 *
 * PENTING (keamanan): TIDAK ADA credential/API key spreadsheet yang
 * disimpan di sini. `VITE_API_URL` hanyalah alamat endpoint Apps
 * Script (bukan rahasia kriptografis) — lihat docs/spreadsheet-integration.md
 * § 8 untuk batasan model keamanan static frontend.
 *
 * OPTIMASI PERFORMA:
 * Menggunakan endpoint `?resource=all` untuk membaca spreadsheet SEKALI
 * dan mengembalikan employees + leave dalam satu HTTP request. Ini
 * mengurangi jumlah round-trip ke GAS dari N request menjadi 1.
 *
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

interface RemoteAllResponse {
  employees: RemoteEmployeeRow[]
  leave: RemoteLeaveYearRow[]
}

function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error(
      'VITE_API_URL belum diisi. Set VITE_DATA_SOURCE=mock (default) atau isi VITE_API_URL di .env untuk memakai data remote.',
    )
  }
  return url
}

/**
 * In-memory promise cache untuk satu session tab.
 * Hilang saat halaman di-refresh → data selalu fresh.
 * Tidak ada durasi kadaluarsa yang panjang.
 */
let pendingAllRequest: Promise<RemoteAllResponse> | null = null

/**
 * Fetch endpoint `?resource=all` — baca spreadsheet SEKALI untuk kedua
 * resource (employees dan leave). Request berikutnya dalam session yang
 * sama akan menunggu promise yang sama (deduplication), bukan buat
 * HTTP request baru.
 */
function fetchAll(): Promise<RemoteAllResponse> {
  if (pendingAllRequest !== null) {
    return pendingAllRequest
  }

  const url = `${getApiUrl()}?resource=all`
  pendingAllRequest = fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Gagal mengambil data dari spreadsheet (HTTP ${response.status}).`)
      }
      return response.json() as Promise<RemoteAllResponse>
    })
    .catch((err: unknown) => {
      // Reset cache saat error agar bisa retry
      pendingAllRequest = null
      throw err
    })

  return pendingAllRequest
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
    // CATATAN (docs/spreadsheet-integration.md § 2): statusAktif belum
    // punya sumber kolom yang dikonfirmasi. Default true kecuali Apps
    // Script mengirim nilainya secara eksplisit - WAJIB ditinjau ulang
    // di Checkpoint 4, bukan tebakan final.
    statusAktif: row.statusAktif ?? true,
  }
}

export async function getRemoteEmployees(): Promise<Employee[]> {
  const { employees } = await fetchAll()
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
  const { leave: rows } = await fetchAll()

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

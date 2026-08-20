import type { LeaveRecord, LeaveHistoryEntry } from '@/types/leave'
import type { LeaveTypeSummaryItem } from '@/types/dashboard'

/**
 * DATA DUMMY — Nilai Cuti Tahunan (N-2/N-1/N) per pegawai.
 *
 * Struktur mengikuti sheet "NILAI CUTI TAHUNAN - AWAL TAHUN" di DUK_Copy.xlsx:
 * rentang tahun 2024–2033, setiap tahun punya nilai N-2, N-1, N.
 *
 * Nilai di sini adalah CONTOH ANGKA MENTAH saja — bukan hasil perhitungan
 * bisnis (arti N-2/N-1/N belum dikonfirmasi, lihat docs/data-mapping.md).
 * Beberapa entri sengaja undefined untuk menguji tampilan "-".
 *
 * CHECKPOINT A3: nilaiTahunan diperluas dari satu tahun (2026) menjadi
 * rentang 2024–2033 agar filter tahun di halaman /cuti berfungsi.
 */
export const mockLeaveRecords: LeaveRecord[] = [
  {
    nip: '198001012005011001',
    nama: 'Pegawai Contoh 001',
    unitKerja: 'Bidang Pengembangan',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: 5,         nMinus1: 10, n: 12 },
      { tahun: 2025, nMinus2: 4,         nMinus1: 12, n: 12 },
      { tahun: 2026, nMinus2: 6,         nMinus1: 12, n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  {
    nip: '198505152010012002',
    nama: 'Pegawai Contoh 002',
    unitKerja: 'Bidang Umum',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: 0,         nMinus1: 6,  n: 12 },
      { tahun: 2025, nMinus2: 3,         nMinus1: 8,  n: 12 },
      { tahun: 2026, nMinus2: 0,         nMinus1: 8,  n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  {
    // Contoh data tidak lengkap — N-2 kosong untuk beberapa tahun.
    nip: '199203102022031003',
    nama: 'Pegawai Contoh 003',
    unitKerja: 'Bidang Umum',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: undefined, nMinus1: 4,  n: 12 },
      { tahun: 2025, nMinus2: undefined, nMinus1: 6,  n: 12 },
      { tahun: 2026, nMinus2: undefined, nMinus1: 6,  n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  {
    nip: '198812202015032004',
    nama: 'Pegawai Contoh 004',
    unitKerja: 'Bidang Pengembangan',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: 8,         nMinus1: 12, n: 12 },
      { tahun: 2025, nMinus2: 6,         nMinus1: 6,  n: 12 },
      { tahun: 2026, nMinus2: 6,         nMinus1: 6,  n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  {
    nip: '199010052018011005',
    nama: 'Pegawai Contoh 005',
    unitKerja: 'Bidang Umum',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: 12,        nMinus1: 12, n: 12 },
      { tahun: 2025, nMinus2: 10,        nMinus1: 12, n: 12 },
      { tahun: 2026, nMinus2: 8,         nMinus1: 12, n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  {
    nip: '199507142021012006',
    nama: 'Pegawai Contoh 006',
    unitKerja: 'Bidang Pengembangan',
    nilaiTahunan: [
      { tahun: 2024, nMinus2: undefined, nMinus1: 6,  n: 12 },
      { tahun: 2025, nMinus2: undefined, nMinus1: 10, n: 12 },
      { tahun: 2026, nMinus2: undefined, nMinus1: 8,  n: 12 },
      { tahun: 2027, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2028, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2029, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2030, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2031, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2032, nMinus2: undefined, nMinus1: undefined, n: undefined },
      { tahun: 2033, nMinus2: undefined, nMinus1: undefined, n: undefined },
    ],
  },
  // Pegawai Contoh 007 sengaja TIDAK memiliki data di sini - untuk
  // menguji empty state "Ringkasan Cuti" saat data belum tersedia.
]

/**
 * DATA DUMMY riwayat pengajuan cuti per transaksi (Checkpoint 3C).
 * Dipakai oleh halaman `/cuti` dan bagian "Riwayat Cuti" di Detail
 * Pegawai. Contoh angka & status saja, bukan data asli.
 */
export const mockLeaveHistory: LeaveHistoryEntry[] = [
  {
    id: 'CT-2026-001',
    nip: '198001012005011001',
    nama: 'Pegawai Contoh 001',
    unitKerja: 'Bidang Pengembangan',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-02-02',
    tanggalSelesai: '2026-02-04',
    jumlahHari: 3,
    status: 'Disetujui',
    tahun: 2026,
  },
  {
    id: 'CT-2026-002',
    nip: '198001012005011001',
    nama: 'Pegawai Contoh 001',
    unitKerja: 'Bidang Pengembangan',
    jenisCuti: 'Cuti Sakit',
    tanggalMulai: '2026-05-10',
    tanggalSelesai: '2026-05-11',
    jumlahHari: 2,
    status: 'Disetujui',
    tahun: 2026,
  },
  {
    id: 'CT-2025-003',
    nip: '198001012005011001',
    nama: 'Pegawai Contoh 001',
    unitKerja: 'Bidang Pengembangan',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2025-08-18',
    tanggalSelesai: '2025-08-22',
    jumlahHari: 5,
    status: 'Disetujui',
    tahun: 2025,
  },
  {
    id: 'CT-2026-004',
    nip: '198505152010012002',
    nama: 'Pegawai Contoh 002',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Melahirkan',
    tanggalMulai: '2026-01-05',
    tanggalSelesai: '2026-04-04',
    jumlahHari: 90,
    status: 'Disetujui',
    tahun: 2026,
  },
  {
    id: 'CT-2026-005',
    nip: '198505152010012002',
    nama: 'Pegawai Contoh 002',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-06-15',
    tanggalSelesai: '2026-06-17',
    jumlahHari: 3,
    status: 'Diajukan',
    tahun: 2026,
  },
  {
    id: 'CT-2026-006',
    nip: '199203102022031003',
    nama: 'Pegawai Contoh 003',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-03-09',
    tanggalSelesai: '2026-03-10',
    jumlahHari: 2,
    status: 'Ditolak',
    tahun: 2026,
  },
  {
    id: 'CT-2025-007',
    nip: '199203102022031003',
    nama: 'Pegawai Contoh 003',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Sakit',
    tanggalMulai: '2025-11-03',
    tanggalSelesai: '2025-11-03',
    jumlahHari: 1,
    status: 'Disetujui',
    tahun: 2025,
  },
  {
    id: 'CT-2026-008',
    nip: '198812202015032004',
    nama: 'Pegawai Contoh 004',
    unitKerja: 'Bidang Pengembangan',
    jenisCuti: 'Cuti Besar',
    tanggalMulai: '2026-07-01',
    tanggalSelesai: '2026-07-25',
    jumlahHari: 25,
    status: 'Disetujui',
    tahun: 2026,
  },
  {
    id: 'CT-2026-009',
    nip: '199010052018011005',
    nama: 'Pegawai Contoh 005',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-04-20',
    tanggalSelesai: '2026-04-21',
    jumlahHari: 2,
    status: 'Disetujui',
    tahun: 2026,
  },
  {
    id: 'CT-2024-010',
    nip: '199010052018011005',
    nama: 'Pegawai Contoh 005',
    unitKerja: 'Bidang Umum',
    jenisCuti: 'Cuti Sakit',
    tanggalMulai: '2024-09-12',
    tanggalSelesai: '2024-09-13',
    jumlahHari: 2,
    status: 'Disetujui',
    tahun: 2024,
  },
  {
    id: 'CT-2026-011',
    nip: '199507142021012006',
    nama: 'Pegawai Contoh 006',
    unitKerja: 'Bidang Pengembangan',
    jenisCuti: 'Cuti Tahunan',
    tanggalMulai: '2026-01-20',
    tanggalSelesai: '2026-01-22',
    jumlahHari: 3,
    status: 'Diajukan',
    tahun: 2026,
  },
  // Pegawai Contoh 007 (NIP 197303081999031007) sengaja TIDAK memiliki
  // riwayat cuti - untuk menguji empty state "Belum terdapat riwayat
  // cuti." di Detail Pegawai.
]

// DATA DUMMY untuk chart "Rekap Cuti Berdasarkan Jenis" di Dashboard
// (Checkpoint 3A). Angka contoh saja - bukan hasil perhitungan dari
// data N-2/N-1/N di atas maupun data DUK asli.
export const mockLeaveTypeSummary: LeaveTypeSummaryItem[] = [
  { jenisCuti: 'Cuti Tahunan', jumlah: 18 },
  { jenisCuti: 'Cuti Sakit', jumlah: 7 },
  { jenisCuti: 'Cuti Melahirkan', jumlah: 2 },
  { jenisCuti: 'Cuti Besar', jumlah: 1 },
]

// DATA DUMMY: NIP pegawai yang berstatus sedang cuti saat ini, untuk
// kartu "Pegawai Sedang Cuti" di Dashboard (Checkpoint 3A).
export const mockNipSedangCuti: string[] = ['199203102022031003', '199507142021012006']

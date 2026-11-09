/**
 * Tipe data untuk modul Persuratan.
 *
 * Struktur mengikuti kolom spreadsheet "naskahmsk-klr" PPSDMPU:
 * No. Urut | Kelompok Naskah | Jenis Naskah | Sifat Naskah |
 * Uraian Informasi | Tanggal Diterima | Tanggal Naskah | Konseptor/OPR
 *
 * Integrasi GAS API belum tersedia — service layer mengembalikan status
 * "not_connected" sampai endpoint tersedia.
 */

export type KelompokNaskah = 'Naskah Keluar' | 'Naskah Masuk' | string

export const JENIS_NASKAH_OPTIONS = [
  'Surat Dinas',
  'Nodin',
  'Nodin Kapus',
  'Nodin Bagum',
  'Nodin Bidik',
  'Nodin Bipel',
  'Berita Acara (BA)',
  'Surat Pernyataan (SP)',
  'Surat Keputusan (KP)',
  'Surat Tugas (ST)',
  'Pengumuman (PG)',
  'Surat Keterangan (SKET)',
  'Sertifikat (SR)',
  'Cuti',
  'Surat Undangan',
  'Tanpa Nomor (TN)',
  'Perintah Lembur (SPKL)',
] as const

export interface NaskahItem {
  /** Nomor urut dari spreadsheet (baris ke-N). */
  noUrut: number
  kelompokNaskah: KelompokNaskah
  jenisNaskah: string
  sifatNaskah: string
  uraianInformasi: string
  /** ISO date string atau kosong. */
  tanggalDiterima: string | null
  /** ISO date string atau kosong. */
  tanggalNaskah: string | null
  konseptorOpr: string | null
}

/** Status koneksi sumber data ke GAS API. */
export type DataSourceStatus = 'connected' | 'not_connected' | 'error'

export interface PersuratanDataResult {
  status: DataSourceStatus
  data: NaskahItem[]
  error?: string
}

/** Filter state yang dipakai hook dan komponen filter. */
export interface PersuratanFilter {
  searchUraian: string
  jenisNaskah: string
  searchKonseptor: string
  kelompokNaskah: string
  tanggalMulai: string
  tanggalSelesai: string
}

export const FILTER_DEFAULTS: PersuratanFilter = {
  searchUraian: '',
  jenisNaskah: '',
  searchKonseptor: '',
  kelompokNaskah: '',
  tanggalMulai: '',
  tanggalSelesai: '',
}

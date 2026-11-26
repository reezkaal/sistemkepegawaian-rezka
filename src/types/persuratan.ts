/**
 * Tipe data untuk modul Persuratan.
 *
 * Struktur mengikuti kolom spreadsheet "Persuratan" PPSDMPU:
 * No. Urut | Kelompok Naskah | Jenis Naskah | Sifat Naskah |
 * Uraian Informasi | Tanggal Diterima | Tanggal Naskah | Type Naskah | Konseptor/OPR
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
  'Perjanjian Kerjasama (PJ)',
  'Notulen Rapat (NR)',
  'Telaah Staf',
] as const

export const TYPE_NASKAH_OPTIONS = [
  'Konvensional',
  'Elektronik',
  'Srikandi',
] as const

export interface NaskahItem {
  /** Nomor urut dari spreadsheet (baris ke-N). */
  noUrut: number
  kelompokNaskah: KelompokNaskah
  jenisNaskah: string
  sifatNaskah: string
  uraianInformasi: string
  /** ISO date string (YYYY-MM-DD) atau null. */
  tanggalDiterima: string | null
  /** ISO date string (YYYY-MM-DD) atau null. */
  tanggalNaskah: string | null
  /** Type naskah: Konvensional, Elektronik, Srikandi, atau null. */
  typeNaskah: string | null
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
  typeNaskah: string
  tanggalMulai: string
  tanggalSelesai: string
}

export const FILTER_DEFAULTS: PersuratanFilter = {
  searchUraian: '',
  jenisNaskah: '',
  searchKonseptor: '',
  kelompokNaskah: '',
  typeNaskah: '',
  tanggalMulai: '',
  tanggalSelesai: '',
}

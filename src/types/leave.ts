/**
 * DRAFT TYPES - STATUS: BELUM DIKONFIRMASI.
 *
 * PENTING: arti bisnis dari N-2 / N-1 / N di sheet
 * "NILAI CUTI TAHUNAN - AWAL TAHUN" belum diketahui secara pasti
 * (lihat docs/data-mapping.md § Open Questions). Field di bawah ini
 * HANYA merepresentasikan nilai mentah per tahun sebagaimana ada di
 * spreadsheet — TIDAK ada rumus "sisa cuti" atau "cuti terpakai" yang
 * dihitung sampai maknanya dikonfirmasi (CHECKPOINT 4).
 */

export interface LeaveYearValue {
  tahun: number
  nMinus2?: number
  nMinus1?: number
  n?: number
}

export interface LeaveRecord {
  nip: string
  nama: string
  unitKerja: string
  nilaiTahunan: LeaveYearValue[]
  // aktifKerja: struktur bulanan (JAN..DES) per tahun - lihat data-mapping.md
}

/**
 * CHECKPOINT 3C — Riwayat pengajuan cuti per pegawai.
 *
 * PENTING: ini adalah struktur CONTOH/MOCK untuk kebutuhan tampilan
 * halaman Cuti & "Riwayat Cuti" di Detail Pegawai. Ini TERPISAH dari
 * `nilaiTahunan` (N-2/N-1/N) di atas, yang berasal dari sheet berbeda
 * ("NILAI CUTI TAHUNAN - AWAL TAHUN") dan masih belum dikonfirmasi
 * arti bisnisnya. Struktur sumber data asli untuk riwayat pengajuan
 * cuti per transaksi (tanggal, jenis, jumlah hari, status) BELUM
 * dikonfirmasi juga — lihat docs/data-mapping.md § 6.
 */
export type StatusCuti = 'Disetujui' | 'Diajukan' | 'Ditolak'

export interface LeaveHistoryEntry {
  id: string
  nip: string
  nama: string
  unitKerja: string
  jenisCuti: string
  tanggalMulai: string
  tanggalSelesai: string
  jumlahHari: number
  status: StatusCuti
  tahun: number
}

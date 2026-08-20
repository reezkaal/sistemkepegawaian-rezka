/**
 * Types khusus untuk kebutuhan tampilan Dashboard (Checkpoint 3A).
 *
 * CATATAN: `pegawaiSedangCuti`, `totalCuti`, dan rekap per jenis cuti di
 * sini adalah ANGKA RINGKASAN untuk kebutuhan tampilan mock saja. Ini
 * TIDAK berkaitan dengan struktur N-2/N-1/N di `types/leave.ts` yang
 * arti bisnisnya belum dikonfirmasi (lihat docs/data-mapping.md) - jenis
 * cuti (Tahunan/Sakit/Melahirkan/Besar) di sini murni data contoh untuk
 * chart "Rekap Cuti Berdasarkan Jenis".
 *
 * Dashboard chart analytics (Style Charts update):
 * Data diturunkan langsung dari mockEmployees — tidak ada hardcoded angka.
 */

export interface DashboardSummary {
  totalPegawai: number
  pegawaiAktif: number
  pegawaiSedangCuti: number
  totalCuti: number
  /** Dihitung dari Employee.statusKepegawaian yang sudah ada — bukan data baru. */
  totalPNS: number
  totalPPPK: number
}

/**
 * Agregat N-2/N-1/N (sheet "NILAI CUTI TAHUNAN") untuk SATU tahun,
 * dijumlahkan lintas seluruh pegawai yang memiliki data untuk tahun
 * tersebut. Dipakai oleh section "Ringkasan Cuti" di Dashboard.
 *
 * PENTING (lihat docs/data-mapping.md § 2 & § 4): ini murni penjumlahan
 * nilai mentah yang sudah ada di `LeaveRecord.nilaiTahunan` — BUKAN
 * klaim bahwa N-2+N-1+N punya arti bisnis tertentu (mis. "saldo cuti
 * yang dapat digunakan"). Arti bisnis N-2/N-1/N sendiri masih BELUM
 * DIKONFIRMASI.
 */
export interface LeaveYearAggregate {
  tahun: number
  totalNMinus2: number
  totalNMinus1: number
  totalN: number
  /** Jumlah pegawai yang memiliki data nilaiTahunan untuk tahun ini. */
  jumlahPegawaiTercatat: number
}

export type JenisCuti = 'Cuti Tahunan' | 'Cuti Sakit' | 'Cuti Melahirkan' | 'Cuti Besar'

export interface LeaveTypeSummaryItem {
  jenisCuti: JenisCuti
  jumlah: number
}

/** Untuk Donut Chart PNS vs PPPK */
export interface StatusKepegawaianStat {
  status: string
  jumlah: number
  persentase: number
}

/** Untuk Horizontal Bar Chart Golongan */
export interface GolonganStat {
  golongan: string
  jumlah: number
}

/** Untuk Horizontal Bar Chart Satker */
export interface SatkerStat {
  satker: string
  jumlah: number
}

/** Untuk Horizontal Bar Chart Bidang/Bagian */
export interface BidangStat {
  bidang: string
  jumlah: number
}

/** Untuk Bar/Donut Chart Pendidikan */
export interface PendidikanStat {
  tingkat: string
  jumlah: number
  persentase: number
}

export interface EmployeeChartData {
  statusKepegawaian: StatusKepegawaianStat[]
  golongan: GolonganStat[]
  satker: SatkerStat[]
  bidang: BidangStat[]
  pendidikan: PendidikanStat[]
}


/**
 * Types khusus untuk kebutuhan tampilan Dashboard.
 *
 * Semua data berasal dari Employee aktual (remote GAS/Spreadsheet).
 * Field mock (pegawaiAktif, pegawaiSedangCuti, totalCuti) telah dihapus
 * karena tidak didukung data spreadsheet:
 * - statusAktif tidak dikirim GAS (remoteDataSource default true)
 * - cuti aktif tidak ada di spreadsheet DUK
 * - mockLeaveTypeSummary adalah data contoh, bukan real
 */

export interface DashboardSummary {
  totalPegawai: number
  /** Dihitung dari Employee.statusKepegawaian === 'PNS'. */
  totalPNS: number
  /** Dihitung dari Employee.statusKepegawaian === 'PPPK'. */
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

/**
 * Status Kepegawaian: PNS, PPPK, atau Tanpa Status (data kosong di spreadsheet).
 * "Tanpa Status" bukan berarti nonaktif — hanya belum terisi di DUK.
 */
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

/** Untuk Horizontal Bar Chart Pendidikan */
export interface PendidikanStat {
  tingkat: string
  jumlah: number
  persentase: number
}

/**
 * Distribusi gender dari field jenisKelamin.
 * "(Belum Terisi)" = data kosong di spreadsheet, bukan kategori gender.
 * Coverage aktual: 175/227 (77.1%) — lihat analisis data aktual.
 */
export interface GenderStat {
  label: string   // "Laki-laki" | "Perempuan" | "(Belum Terisi)"
  jumlah: number
  persentase: number
}

/**
 * Distribusi kelompok usia, dihitung dari field tanggalLahir.
 * Pegawai tanpa tanggalLahir valid dikecualikan dan dilaporkan terpisah.
 * Coverage aktual: 190/227 (83.7%) — lihat analisis data aktual.
 */
export interface UsiaStat {
  kelompok: string  // "< 30 Tahun" | "30–39 Tahun" | "40–49 Tahun" | "50–59 Tahun" | "60+ Tahun"
  jumlah: number
}

export interface EmployeeChartData {
  statusKepegawaian: StatusKepegawaianStat[]
  golongan: GolonganStat[]
  satker: SatkerStat[]
  bidang: BidangStat[]
  pendidikan: PendidikanStat[]
  /** Distribusi gender dari jenisKelamin — termasuk "(Belum Terisi)" untuk data kosong. */
  gender: GenderStat[]
  /** Distribusi usia dari tanggalLahir — hanya pegawai dengan tanggalLahir valid. */
  usia: UsiaStat[]
  /** Jumlah pegawai dengan tanggalLahir valid, untuk disclaimer chart usia. */
  usiaDataValid: number
  /** Total seluruh pegawai, untuk disclaimer coverage. */
  totalPegawai: number
}


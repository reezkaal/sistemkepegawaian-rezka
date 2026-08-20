/**
 * DRAFT TYPES - belum final.
 *
 * Field-field berikut didasarkan pada daftar kolom yang disebutkan di
 * requirement (lihat docs/data-mapping.md), TAPI arti bisnis beberapa
 * field (terutama struktur cuti N-2/N-1/N) BELUM dikonfirmasi.
 *
 * Jangan menambahkan field turunan (mis. "sisaCuti", "cutiTerpakai")
 * di sini sebelum rumusnya didokumentasikan & disetujui di
 * docs/data-mapping.md (lihat CHECKPOINT 4).
 *
 * `EmployeeListItem` sudah disesuaikan pada CHECKPOINT A1 dengan
 * struktur kolom sheet DUK asli (Satker & Bidang/Bagian terpisah,
 * Golongan, Status Kepegawaian) — lihat definisi di bawah.
 *
 * CHECKPOINT A2 — field baru ditambahkan sesuai struktur DUK_Copy.xlsx.
 * Field lama (`tmt`, `gelar`, `pendidikanTerakhir`, `institusiPendidikan`,
 * `jurusan`) dipertahankan agar tidak merusak referensi yang sudah ada.
 */

export type JenisKelamin = 'L' | 'P'

export type StatusKepegawaian = 'PNS' | 'PPPK' | string // menunggu daftar nilai pasti dari sumber data

export interface Employee {
  // ── Identitas utama ───────────────────────────────────────────────
  nip: string
  nama: string

  // ── Field lama (dipertahankan, tidak dihapus) ─────────────────────
  /** @deprecated Gunakan tmtGolongan / tmtPengangkatan / tmtJabatan (A2). */
  tmt?: string
  /** @deprecated Gunakan gelarDepan / gelarBelakang (A2). */
  gelar?: string
  /** @deprecated Gunakan tingkatPendidikan (A2). */
  pendidikanTerakhir?: string
  institusiPendidikan?: string
  jurusan?: string

  // ── Data Kepegawaian (A2) ─────────────────────────────────────────
  golongan?: string
  /** TMT Golongan — Terhitung Mulai Tanggal naik golongan terakhir. */
  tmtGolongan?: string
  /** TMT Pengangkatan — Terhitung Mulai Tanggal diangkat sebagai PNS/PPPK. */
  tmtPengangkatan?: string
  /** TMT Jabatan — Terhitung Mulai Tanggal menduduki jabatan saat ini. */
  tmtJabatan?: string
  /** Pendidikan pada saat pengangkatan (dari DUK, berbeda dengan pendidikan terakhir). */
  pendidikanPengangkatan?: string
  jabatan?: string
  kelasJabatan?: string
  eselon?: string
  statusKepegawaian: StatusKepegawaian
  satuanKerja: string
  bidangBagian?: string
  subBagian?: string
  nomorAbsensi?: string

  // ── Data Pribadi (A2) ─────────────────────────────────────────────
  jenisKelamin?: JenisKelamin
  tempatLahir?: string
  /** Format ISO YYYY-MM-DD. */
  tanggalLahir?: string
  agama?: string
  gelarDepan?: string
  gelarBelakang?: string
  nik?: string
  alamat?: string

  // ── Data Pendidikan (A2) ──────────────────────────────────────────
  /** Tingkat pendidikan terakhir, mis. "S1", "D3", "SMA". */
  tingkatPendidikan?: string
  tahunLulus?: string

  // ── Data Kontak & Administratif (A2) ─────────────────────────────
  emailPribadi?: string
  emailDinas?: string
  idBkn?: string
  kerpeg?: string
  noHp?: string
  namaRekening?: string
  noRekening?: string
  bank?: string
  npwp?: string

  // ── Status (dipertahankan dari Checkpoint 3B) ─────────────────────
  statusAktif: boolean
}

/**
 * CHECKPOINT A1 — Item ringkas untuk tabel Menu Pegawai (Checkpoint 3B,
 * direvisi A1). Mengikuti struktur sheet DUK asli: `satker` (kolom
 * SATKER) dan `bidangBagian` (kolom BIDANG/BAGIAN) adalah field
 * TERPISAH — TIDAK digabung menjadi "unitKerja". `statusKepegawaian`
 * berasal dari kolom STATUS (mis. PNS/PPPK), BUKAN `statusAktif`
 * (boolean) yang dipakai di Detail Pegawai/Dashboard.
 */
export interface EmployeeListItem {
  nip: string
  nama: string
  jabatan?: string
  golongan?: string
  satker: string
  bidangBagian?: string
  statusKepegawaian: StatusKepegawaian
}

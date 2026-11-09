/**
 * Service layer untuk modul Persuratan.
 *
 * GAS API belum tersedia. Semua fungsi mengembalikan status
 * "not_connected" agar UI menampilkan empty state yang jelas.
 *
 * Untuk integrasi GAS API pada tahap berikutnya:
 * 1. Ganti konstanta GAS_ENDPOINT dengan URL GAS deployment.
 * 2. Ubah DATA_SOURCE menjadi 'remote'.
 * 3. Implementasikan fetchFromGas() sesuai format response GAS.
 * 4. Signature semua fungsi yang diekspor TIDAK perlu berubah —
 *    hook dan komponen tidak perlu dimodifikasi.
 *
 * Format response GAS yang diharapkan:
 * { status: 'ok', data: NaskahItem[] }
 * atau
 * { status: 'error', message: string }
 */

import type { NaskahItem, PersuratanDataResult, PersuratanFilter } from '@/types/persuratan'

// ponytail: ubah ke 'remote' dan isi GAS_ENDPOINT saat API tersedia
const DATA_SOURCE: 'mock' | 'remote' = 'mock'
const GAS_ENDPOINT = ''

/** Data contoh — hanya untuk preview tampilan. Bukan data aktual PPSDMPU. Seluruh sifat naskah bernilai "Biasa". */
const MOCK_DATA: NaskahItem[] = [
  {
    noUrut: 1,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Dinas',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Dinas Kepala PPSDMPU Perhubungan Udara Nomor : AG.210/1/1/PPSDMPU/2024 Kepada Direktur Keamanan Penerbangan Hal Penyampaian Laporan Berkala',
    tanggalDiterima: null,
    tanggalNaskah: '2024-04-04',
    konseptorOpr: 'Bagian TU',
  },
  {
    noUrut: 2,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Dinas',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Dinas Kepala PPSDMPU Perhubungan Udara Nomor : MK.201/1/1/PPSDMPU/2024 Kepada Hal Perjanjian Kerja PPNPN a.n Adi Firmansyah',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-02',
    konseptorOpr: 'Bagian Kepegawaian',
  },
  {
    noUrut: 3,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Nodin',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Kepala Subbagian Keuangan & BMN Kepada Kepala Bagian Tata Usaha Nomor : ND.005/TU/PPSDMPU/2024 Hal Laporan Pelaksanaan Rekonsiliasi BMN Semester II',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-12',
    konseptorOpr: 'Subbag Keuangan & BMN',
  },
  {
    noUrut: 4,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Nodin Kapus',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Kepala PPSDMPU Kepada Seluruh Koordinator Bidang Nomor : ND.012/KAPUS/PPSDMPU/2024 Hal Arahan Peningkatan Mutu Pelayanan Pelatihan Penerbangan',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-15',
    konseptorOpr: 'Kapus PPSDMPU',
  },
  {
    noUrut: 5,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Nodin Bagum',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Kepala Bagian Umum Kepada Seluruh Unit Kerja Nomor : ND.020/BAGUM/PPSDMPU/2024 Hal Pemeliharaan Rutin Sarana dan Prasarana Gedung Kantor',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-18',
    konseptorOpr: 'Bagian Umum',
  },
  {
    noUrut: 6,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Nodin Bidik',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Kepala Bidang Pendidikan Kepada Kepala PPSDMPU Nomor : ND.015/BIDIK/PPSDMPU/2024 Hal Penyusunan Kurikulum dan Silabus Diklat Penerbangan TA 2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-22',
    konseptorOpr: 'Bidang Pendidikan',
  },
  {
    noUrut: 7,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Nodin Bipel',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Kepala Bidang Pelatihan Kepada Kepala Bagian TU Nomor : ND.018/BIPEL/PPSDMPU/2024 Hal Jadwal Penyelenggaraan Pelatihan Teknis Aviasi Gelombang I',
    tanggalDiterima: null,
    tanggalNaskah: '2024-01-25',
    konseptorOpr: 'Bidang Pelatihan',
  },
  {
    noUrut: 8,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Berita Acara (BA)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Berita Acara Serah Terima Hasil Pekerjaan Pengadaan Peralatan Laboratorium Simulator Penerbangan Nomor : BA.003/BMN/PPSDMPU/2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-01',
    konseptorOpr: 'Tim Pengadaan',
  },
  {
    noUrut: 9,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Pernyataan (SP)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Pernyataan Tanggung Jawab Mutlak (SPTJM) Penggunaan Alokasi Anggaran Belanja Modal Semester I Tahun Anggaran 2024 Nomor : SP.004/KAPUS/PPSDMPU/2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-05',
    konseptorOpr: 'Bagian Keuangan',
  },
  {
    noUrut: 10,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Keputusan (KP)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Keputusan Kepala PPSDMPU Nomor : SK.008/PPSDMPU/2024 tentang Penetapan Panitia Seleksi Calon Taruna dan Peserta Diklat Penerbangan Terpadu Tahun 2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-10',
    konseptorOpr: 'Bagian Kepegawaian',
  },
  {
    noUrut: 11,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Tugas (ST)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Tugas Nomor : ST.042/PPSDMPU/2024 tentang Penugasan Tim Asesor Pengawasan dan Evaluasi Mutu Diklat Teknis di Balai Kalibrasi Fasilitas Penerbangan',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-15',
    konseptorOpr: 'Bagian TU',
  },
  {
    noUrut: 12,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Pengumuman (PG)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Pengumuman Kepala PPSDMPU Nomor : PG.002/PPSDMPU/2024 tentang Pembukaan Pendaftaran Pelatihan Operasi Pesawat Udara dan Navigasi Penerbangan Angkatan IV',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-20',
    konseptorOpr: 'Bidang Pelatihan',
  },
  {
    noUrut: 13,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Keterangan (SKET)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Keterangan Aktif Bekerja Pegawai PPNPN Unit Layanan Pengujian Nomor : SKET.011/PEG/PPSDMPU/2024 a.n Dara Ta\'al Ramadhani',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-22',
    konseptorOpr: 'Bagian Kepegawaian',
  },
  {
    noUrut: 14,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Sertifikat (SR)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Penerbitan Sertifikat Kelulusan Peserta Diklat Basic Aviation Security Angkatan II Nomor Registrasi : SR.105/DIKLAT/PPSDMPU/2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-02-26',
    konseptorOpr: 'Bidang Pelatihan',
  },
  {
    noUrut: 15,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Cuti',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Permohonan dan Persetujuan Cuti Tahunan Pegawai ASN Nomor : CT.021/PPSDMPU/2024 a.n Eko Apriliyanto',
    tanggalDiterima: null,
    tanggalNaskah: '2024-03-01',
    konseptorOpr: 'Bagian Kepegawaian',
  },
  {
    noUrut: 16,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Undangan',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Undangan Rapat Evaluasi Capaian Kinerja dan Penyerapan Anggaran Triwulan I PPSDMPU Nomor : UND.014/TU/PPSDMPU/2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-03-05',
    konseptorOpr: 'Bagian TU',
  },
  {
    noUrut: 17,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Tanpa Nomor (TN)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Lembar Konfirmasi dan Biodata Kehadiran Calon Instruktur Tamu Diklat Teknis Aviasi dari Otoritas Bandar Udara Wilayah I',
    tanggalDiterima: '2024-03-08',
    tanggalNaskah: '2024-03-07',
    konseptorOpr: 'Otban Wilayah I',
  },
  {
    noUrut: 18,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Perintah Lembur (SPKL)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Perintah Kerja Lembur Pelaksanaan Ujian Sertifikasi Kompetensi Pilot dan Personel Penerbangan Akhir Pekan Nomor : SPKL.007/TU/PPSDMPU/2024',
    tanggalDiterima: null,
    tanggalNaskah: '2024-03-12',
    konseptorOpr: 'Bagian Umum',
  },
  {
    noUrut: 19,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Surat Dinas',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Dinas Kepala Biro Kepegawaian Kemenhub Kepada Kepala PPSDMPU Nomor : KP.003/2/BIRO-KP/2024 Hal Pemutakhiran Data Pegawai Semester I 2024',
    tanggalDiterima: '2024-03-15',
    tanggalNaskah: '2024-03-13',
    konseptorOpr: 'Biro Kepegawaian',
  },
  {
    noUrut: 20,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Nodin',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Nota Dinas Sesditjen Perhubungan Udara Kepada Kepala PPSDMPU Nomor : ND.002/SETDITJEN/2024 Hal Koordinasi Teknis Penerapan Standar Kurikulum ICAO',
    tanggalDiterima: '2024-03-20',
    tanggalNaskah: '2024-03-18',
    konseptorOpr: 'Sesditjen PU',
  },
  {
    noUrut: 21,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Surat Undangan',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Undangan Sekretaris BPSDMP Nomor : UND.089/BPSDMP/2024 Hal Rapat Koordinasi Perencanaan Anggaran Diklat Terpadu Kemenhub TA 2025',
    tanggalDiterima: '2024-03-25',
    tanggalNaskah: '2024-03-23',
    konseptorOpr: 'BPSDMP',
  },
  {
    noUrut: 22,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Surat Tugas (ST)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Tugas Ditjen Perhubungan Udara Nomor : ST.112/DJPU/2024 tentang Penugasan Tim Ahli Pemateri Workshop Aviation Safety Management System',
    tanggalDiterima: '2024-03-28',
    tanggalNaskah: '2024-03-26',
    konseptorOpr: 'DJPU',
  },
  {
    noUrut: 23,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Berita Acara (BA)',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Berita Acara Hasil Uji Petik dan Rekonsiliasi Realisasi Anggaran Triwulan I Unit Pelaksana Teknis Lingkungan BPSDMP Nomor : BA.019/BPSDMP/2024',
    tanggalDiterima: '2024-04-02',
    tanggalNaskah: '2024-03-31',
    konseptorOpr: 'BPSDMP',
  },
  {
    noUrut: 24,
    kelompokNaskah: 'Naskah Keluar',
    jenisNaskah: 'Surat Dinas',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Dinas Kepala PPSDMPU Kepada Kepala BPSDMP Nomor : PR.001/2/PPSDMPU/2024 Hal Penyampaian Laporan Akuntabilitas Kinerja Instansi Pemerintah (LAKIP) Tahun 2023',
    tanggalDiterima: null,
    tanggalNaskah: '2024-04-05',
    konseptorOpr: 'Bagian TU',
  },
  {
    noUrut: 25,
    kelompokNaskah: 'Naskah Masuk',
    jenisNaskah: 'Surat Dinas',
    sifatNaskah: 'Biasa',
    uraianInformasi: 'Surat Dinas Direktur Jenderal Perhubungan Udara Kepada Kepala PPSDMPU Nomor : AU.008/1/1/DJPU/2024 Hal Rencana Program Diklat Penerbangan Prioritas Nasional Tahun 2024',
    tanggalDiterima: '2024-01-10',
    tanggalNaskah: '2024-01-08',
    konseptorOpr: 'DJPU',
  },
]

/** Ambil semua naskah dari sumber data. */
export async function getNaskahList(): Promise<PersuratanDataResult> {
  if (DATA_SOURCE === 'mock') {
    // Simulasi delay seperti service lain di aplikasi ini
    await new Promise((r) => setTimeout(r, 300))
    return { status: 'connected', data: MOCK_DATA }
  }

  if (!GAS_ENDPOINT) {
    return { status: 'not_connected', data: [] }
  }

  try {
    const res = await fetch(`${GAS_ENDPOINT}?action=getNaskahList`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if (json.status !== 'ok') throw new Error(json.message ?? 'Unknown error')
    return { status: 'connected', data: json.data as NaskahItem[] }
  } catch (err) {
    return {
      status: 'error',
      data: [],
      error: err instanceof Error ? err.message : 'Gagal mengambil data persuratan.',
    }
  }
}

/** Ambil naskah berdasarkan kelompok (Masuk/Keluar). */
export async function getNaskahByKelompok(kelompok: string): Promise<PersuratanDataResult> {
  const result = await getNaskahList()
  if (result.status !== 'connected') return result
  return {
    ...result,
    data: result.data.filter((n) => n.kelompokNaskah === kelompok),
  }
}

/** Filter dan pencarian client-side dari data yang sudah diambil. */
export function filterNaskah(data: NaskahItem[], filter: PersuratanFilter): NaskahItem[] {
  const uraian = filter.searchUraian.trim().toLowerCase()
  const konseptor = filter.searchKonseptor.trim().toLowerCase()
  const jenis = filter.jenisNaskah.trim().toLowerCase()

  return data.filter((n) => {
    if (uraian && !n.uraianInformasi.toLowerCase().includes(uraian)) return false
    if (jenis && n.jenisNaskah.toLowerCase() !== jenis) return false
    if (konseptor && !(n.konseptorOpr ?? '').toLowerCase().includes(konseptor)) return false
    if (filter.kelompokNaskah && n.kelompokNaskah !== filter.kelompokNaskah) return false
    if (filter.tanggalMulai && n.tanggalNaskah && n.tanggalNaskah < filter.tanggalMulai) return false
    if (filter.tanggalSelesai && n.tanggalNaskah && n.tanggalNaskah > filter.tanggalSelesai) return false
    return true
  })
}

/** Hitung jumlah data kosong atau tidak lengkap. */
export function countIncomplete(data: NaskahItem[]): number {
  return data.filter(
    (n) =>
      !n.uraianInformasi.trim() ||
      !n.jenisNaskah.trim() ||
      !n.tanggalNaskah,
  ).length
}

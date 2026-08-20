# Data Mapping — Sheet DUK

**Status: DRAFT / BELUM DIKONFIRMASI.** Jangan membuat rumus bisnis atau
kolom turunan (mis. "Sisa Cuti", "Cuti Terpakai") berdasarkan asumsi apa
pun di file ini sampai bagian "Open Questions" di bawah dijawab oleh
pemilik data.

## 1. Data Kepegawaian (sheet `DUK`)

Kolom-kolom berikut disebutkan tersedia di sumber data. Mapping nama
kolom spreadsheet → nama field aplikasi **belum divalidasi terhadap
header sheet yang sebenarnya** (perlu dicek langsung di Checkpoint 4):

| Field Aplikasi (draft) | Kemungkinan Kolom Sumber | Ditampilkan di |
|---|---|---|
| `nomor` | Nomor | (internal saja / DUK) |
| `nama` | Pegawai | Pegawai, Detail |
| `nip` | NIP | Pegawai, Detail, Cuti |
| `tmt` | TMT | Detail |
| `golongan` | Golongan | Detail |
| `jabatan` | Jabatan | Pegawai, Detail |
| `kelasJabatan` | Kelas Jabatan | Detail |
| `eselon` | Eselon | Detail |
| `statusKepegawaian` | Status kepegawaian | Pegawai, Detail, Dashboard |
| `satuanKerja` | Satker | Pegawai (filter), Detail |
| `bidangBagian` | Bidang/Bagian | Pegawai (filter), Detail |
| `subBagian` | Sub Bagian | Detail |
| `jenisKelamin` | Jenis Kelamin | Detail (jika diperlukan) |
| `tempatTanggalLahir` | Tempat/Tanggal Lahir | Detail (evaluasi kebutuhan — data personal) |
| `pendidikanTerakhir` | Pendidikan / Pendidikan terakhir | Detail |
| `institusiPendidikan` | Institusi pendidikan | Detail |
| `jurusan` | Jurusan | Detail |

Field yang **tidak akan ditampilkan** ke UI kecuali terbukti diperlukan
(prinsip data minimization, § 4/§ 20 requirement): data administrasi
lain yang bersifat sensitif dan tidak esensial untuk kebutuhan dashboard.

## 2. Data Cuti — sheet "NILAI CUTI TAHUNAN - AWAL TAHUN"

Struktur yang diketahui: dikelompokkan per tahun, dengan kolom/label
`N-2`, `N-1`, `N`.

**BELUM DIKONFIRMASI — jangan menebak:**
- Apa arti bisnis `N-2`, `N-1`, `N`? (mis. apakah ini saldo cuti tahun
  berjalan-2, sisa cuti carry-over, jatah cuti per tahun tersebut, dsb.)
- Apakah nilai-nilai ini sudah merupakan hasil perhitungan (saldo akhir)
  atau input mentah (jatah awal tahun)?
- Bagaimana cara menghitung "cuti terpakai" dan "sisa cuti" — apakah
  datanya tersedia langsung di spreadsheet atau perlu dihitung dari
  data "AKTIF KERJA"?

Sampai pertanyaan di atas dijawab: aplikasi HANYA akan menampilkan nilai
mentah N-2/N-1/N apa adanya (lihat `src/types/leave.ts`), TANPA kolom
"Sisa Cuti" atau "Cuti Terpakai" (lihat § 10 requirement).

## 3. Data Aktif Kerja — sheet "AKTIF KERJA"

Struktur yang diketahui: dikelompokkan per tahun dan bulan
(JAN–DES).

**BELUM DIKONFIRMASI:**
- Apa isi nilai per sel bulan? (mis. jumlah hari aktif, status
  ya/tidak, jumlah cuti diambil bulan itu, dll.)
- Apakah data ini dipakai untuk menghitung cuti terpakai, atau untuk
  keperluan lain (mis. statistik kehadiran)?

## 4. Checkpoint 3C — Asumsi UI untuk "Ringkasan Cuti" & "Riwayat Cuti"

**Status: bukan konfirmasi data sumber — ini mendokumentasikan asumsi
tampilan (UI) yang dipakai sementara, sesuai instruksi eksplisit
pemilik project untuk Checkpoint 3C.**

### 4.1 Ringkasan Cuti (N-2 / N-1 / N) di Detail Pegawai

- Tahun berjalan untuk keperluan tampilan di-hardcode sebagai **2026**
  (`TAHUN_BERJALAN` di `src/hooks/useLeaveSummary.ts`). Label kolom
  diturunkan otomatis dari tahun ini: N-2 = 2024, N-1 = 2025, N = 2026.
- **Total Cuti = N-2 + N-1 + N**, dihitung SECARA DINAMIS di komponen
  UI (`LeaveSummaryCard`), BUKAN field yang disimpan di
  `src/types/leave.ts` atau mock data. Tidak ada field `totalCuti`
  ditambahkan ke `LeaveRecord`/`LeaveYearValue`.
- N-2, N-1, N tetap ditampilkan sebagai tiga baris terpisah — Total
  Cuti adalah baris tambahan/ringkasan, bukan pengganti ketiganya.
- **Total Cuti secara eksplisit BUKAN "Sisa Cuti"** dan BUKAN saldo
  cuti yang otomatis dapat digunakan pegawai. UI menampilkan catatan
  ini secara langsung di bawah angka Total Cuti (lihat
  `LeaveSummaryCard`) agar tidak menyesatkan pengguna awam.
- Arti bisnis N-2/N-1/N sendiri **masih BELUM DIKONFIRMASI** (lihat
  § 2 di atas) — menjumlahkannya menjadi "Total Cuti" adalah operasi
  tampilan (UI) atas nilai mentah, bukan klaim bahwa penjumlahan ini
  punya makna HR tertentu (mis. jatah tahunan gabungan). Setelah
  Checkpoint 4 mengonfirmasi arti sebenarnya, bagian ini WAJIB
  ditinjau ulang.
- Nilai per tahun yang kosong/`undefined` ditangani dengan aman:
  ditampilkan sebagai `-` per baris, dan tidak dianggap `0` untuk
  baris itu sendiri; namun untuk perhitungan Total Cuti, nilai yang
  kosong diperlakukan sebagai `0` (dijumlahkan) agar Total tetap bisa
  dihitung. Jika pegawai sama sekali tidak punya data ringkasan cuti
  (tidak ada entri di `mockLeaveRecords`), UI menampilkan pesan "Belum
  terdapat data ringkasan cuti untuk pegawai ini." — TIDAK menampilkan
  Total Cuti = 0 yang bisa disalahartikan sebagai data valid.

### 4.2 Riwayat Cuti (halaman `/cuti` & Detail Pegawai)

- Struktur `LeaveHistoryEntry` (`src/types/leave.ts`) — berisi jenis
  cuti, periode/tanggal, jumlah hari, status per pengajuan — adalah
  struktur CONTOH untuk kebutuhan tampilan Checkpoint 3C. Ini
  **terpisah** dari sheet "NILAI CUTI TAHUNAN - AWAL TAHUN" yang
  dibahas di § 2, dan pemetaan ke sheet/kolom sumber data asli untuk
  riwayat per transaksi ini **belum dikonfirmasi**.
- Nilai `status` yang dipakai (`Disetujui` / `Diajukan` / `Ditolak`)
  dan `jenisCuti` (`Cuti Tahunan` / `Cuti Sakit` / `Cuti Melahirkan` /
  `Cuti Besar`) adalah contoh yang wajar untuk konteks cuti PNS/PPPK,
  BUKAN daftar nilai final dari sumber data.

Rumus/label final untuk kedua bagian ini harus ditinjau ulang begitu
jawaban di § 5 (Open Questions) tersedia.

## 5. Open Questions (untuk pemilik data / petugas PPSDMPU)

1. Apa definisi tepat kolom N-2 / N-1 / N di "NILAI CUTI TAHUNAN"?
2. Apakah ada kolom eksplisit "Sisa Cuti" di spreadsheet, atau memang
   perlu dihitung? Jika perlu dihitung, dari kolom apa saja dan dengan
   rumus apa?
3. Apa isi nilai bulanan di "AKTIF KERJA" — dan apakah relevan untuk
   perhitungan cuti?
4. Apakah nilai `Status kepegawaian` hanya berisi `PNS` / `PPPK`, atau
   ada nilai lain (mis. CPNS, Honorer)?
5. Kolom mana saja di sheet DUK yang termasuk kategori "data sensitif"
   dan tidak boleh diekspos ke frontend sama sekali?

## 6. Cara Menjawab

Setelah jawaban tersedia (langsung dari pemilik project atau dengan
memeriksa header/isi sheet asli di Checkpoint 4), update tabel & bagian
di atas, lalu perbarui `src/types/leave.ts` dan `src/mock/leave.ts`
sesuai struktur final. Rumus bisnis apa pun (mis. sisa cuti) harus
ditulis eksplisit di file ini sebelum diimplementasikan di kode.

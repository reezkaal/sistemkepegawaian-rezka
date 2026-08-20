# Integrasi Spreadsheet Online — Analisis & Kontrak API

**Status: PERSIAPAN untuk Checkpoint 5.** Dokumen ini adalah hasil analisis
struktur project + rencana migrasi dari mock data ke spreadsheet online.
Belum ada endpoint Apps Script sungguhan yang di-deploy/diuji — lihat
`docs/progress.md` untuk status implementasi.

## 1. Ketergantungan Mock Data Saat Ini (Dependency Map)

Seluruh akses data SUDAH melalui satu pintu: `src/services/api.ts`.
Tidak ada component atau hook yang fetch/mock langsung, KECUALI `useAuth`
(auth sengaja di luar cakupan tahap ini — lihat `docs/authentication.md`).

```
mock/employees.ts ──┐
mock/leave.ts ───────┼──> services/api.ts ──> 9 hooks ──> pages/components
mock/authUsers.ts ──(hanya dipakai useAuth.ts, di luar cakupan tahap ini)
```

| Hook | Fungsi `api.ts` yang dipanggil | Sumber mock |
|---|---|---|
| `useEmployeeList` | `getEmployees` | `mockEmployees` |
| `useEmployeeSearch` | `searchEmployees` | `mockEmployees` |
| `useEmployeeDetail` | `getEmployeeByNip` | `mockEmployees` |
| `useEmployeeCharts` | `getEmployeeChartData` | `mockEmployees` |
| `useDashboardSummary` | `getDashboardSummary`, `getLeaveTypeSummary`, `getLeaveYearAggregate` | `mockEmployees` + `mockLeaveRecords` + `mockLeaveTypeSummary` |
| `useLeaveTable` (dipakai `Leave.tsx`) | `getLeaveRecords` | `mockLeaveRecords` |
| `useLeaveSummary` | `getLeaveSummaryByNip` | `mockLeaveRecords` |
| `useLeaveList` | `getLeaveHistory` | `mockLeaveHistory` — **ORPHANED**, tidak dipakai halaman manapun saat ini |
| `useLeaveHistoryByEmployee` | `getLeaveHistoryByNip` | `mockLeaveHistory` — **ORPHANED**, `LeaveHistoryCard` tidak lagi dirender di `EmployeeDetail.tsx` sejak Checkpoint A3 |

Karena semua data hook lewat `api.ts`, migrasi sumber data bisa dilakukan
**tanpa menyentuh satu pun hook/komponen/halaman**, selama signature
fungsi yang diekspor `api.ts` tidak berubah.

## 2. Mapping: Spreadsheet → `Employee`

Sumber: sheet `DUK` di `DUK_Copy.xlsx`, kolom A–AM (identitas s.d.
administrasi), 233 baris data per audit sebelumnya.

| Kolom Sheet DUK | Field `Employee` | Catatan |
|---|---|---|
| B (PEGAWAI) | `nama` | |
| C (NIP) | `nip` | |
| D (TMT Golongan) | `tmtGolongan` | |
| E (GOL) | `golongan` | format campur PNS (`III/b`) vs PPPK (`IX`) — lihat § 5 Open Question lama di `data-mapping.md` |
| F (Pendidikan saat pengangkatan) | `pendidikanPengangkatan` | beda dari pendidikan terakhir |
| G (TMT Pengangkatan) | `tmtPengangkatan` | |
| H (TMT Jabatan) | `tmtJabatan` | |
| I (JABATAN) | `jabatan` | |
| J (KLS JABATAN) | `kelasJabatan` | |
| K (ESELON) | `eselon` | |
| L (STATUS) | `statusKepegawaian` | nilai teramati: `PNS`, `PPPK` |
| M (SATKER) | `satuanKerja` | |
| N (BIDANG/BAGIAN) | `bidangBagian` | |
| O (SUB BAGIAN) | `subBagian` | |
| P (NO.ABSENSI) | `nomorAbsensi` | |
| Q (JK) | `jenisKelamin` | `L` / `P` |
| R (TEMPAT LAHIR) | `tempatLahir` | |
| S (TTL) | `tanggalLahir` | |
| T (AGAMA) | `agama` | |
| U (GELAR depan) | `gelarDepan` | |
| V (GELAR belakang) | `gelarBelakang` | |
| W (Pendidikan Terakhir - Tingkat) | `tingkatPendidikan` | |
| X (Thn Lulus) | `tahunLulus` | |
| Y (Institusi) | `institusiPendidikan` | |
| Z (Jurusan) | `jurusan` | |
| AA (ALAMAT) | `alamat` | |
| AB (EMAIL PRIBADI) | `emailPribadi` | |
| AC (EMAIL DINAS) | `emailDinas` | |
| AD (ID BKN) | `idBkn` | |
| AE (KERPEG) | `kerpeg` | |
| AH (NIK) | `nik` | sensitif — sudah di-mask di UI Detail Pegawai |
| AI (NO HP) | `noHp` | |
| AJ (NAMA REK) | `namaRekening` | sensitif |
| AK (NO REK) | `noRekening` | sensitif — sudah di-mask di UI |
| AL (BANK) | `bank` | |
| AM (NPWP) | `npwp` | sensitif — sudah di-mask di UI |

**Field TANPA sumber kolom jelas di spreadsheet:** `statusAktif`
(boolean, dipakai untuk badge Aktif/Tidak Aktif & stat card "Pegawai
Aktif"). Ini **BELUM DIKONFIRMASI** artinya dari mana (audit sebelumnya
sudah mencatat ini) — untuk tahap integrasi, field ini SEMENTARA
di-default `true` dari sisi mapper (`src/services/remoteDataSource.ts`)
kecuali Apps Script secara eksplisit mengirim nilainya. **Wajib
diklarifikasi di Checkpoint 4**, bukan tahap ini.

## 3. Mapping: Spreadsheet → `LeaveRecord`

Sumber: blok kolom AT–BW (10 tahun × 3 nilai N-2/N-1/N per tahun),
di-flatten oleh Apps Script menjadi baris panjang (long format) — lebih
sederhana ditulis di sisi Apps Script daripada nested JSON per pegawai.
Grouping per NIP dilakukan di sisi client (`remoteDataSource.ts`).

| Kolom Sheet DUK | Field baris JSON (kontrak, § 5) |
|---|---|
| C (NIP) | `nip` |
| B (PEGAWAI) | `nama` |
| N (BIDANG/BAGIAN) | `unitKerja` |
| header tahun tiap blok (mis. 2024) | `tahun` |
| N-2 | `nMinus2` |
| N-1 | `nMinus1` |
| N | `n` |

**Arti bisnis N-2/N-1/N masih BELUM DIKONFIRMASI** (lihat
`data-mapping.md` § 2) — mapping ini hanya memindahkan nilai mentah,
tidak menambah rumus baru.

## 4. Mapping: Dashboard

Dashboard **tidak butuh sheet/endpoint terpisah**. Semua agregat
(`getDashboardSummary`, `getEmployeeChartData`, `getLeaveYearAggregate`)
sudah dihitung di `api.ts` dari array `Employee[]`/`LeaveRecord[]` yang
sama — baik itu dari mock maupun dari remote. Tidak ada perubahan pada
logika agregasi, hanya sumber array mentahnya yang berpindah (lihat § 6).

## 5. Bagian yang SENGAJA TIDAK dimigrasikan tahap ini

- `LeaveHistoryEntry` / `mockLeaveHistory` / `getLeaveHistory` /
  `getLeaveHistoryByNip` / `useLeaveList` / `useLeaveHistoryByEmployee`
  / `LeaveHistoryCard`: tidak ada kolom sumber di spreadsheet DUK
  (dikonfirmasi ulang di `data-mapping.md` § 4.2) DAN sudah tidak
  dirender di halaman manapun sejak Checkpoint A3. Tetap pakai mock,
  atau ditinjau untuk dihapus di checkpoint mendatang — bukan tahap ini.
- `mockLeaveTypeSummary` (chart jenis cuti Tahunan/Sakit/Melahirkan/
  Besar) & `mockNipSedangCuti`: data contoh murni, tidak berbasis
  kolom spreadsheet nyata. Tetap mock sampai ada sumber data yang jelas.
- Data "AKTIF KERJA" (blok kolom BY–GN): belum ada type/hook/UI sama
  sekali — di luar cakupan tahap ini.

## 6. Kolom yang Diperlukan dari Apps Script (Data Minimization)

Sesuai CLAUDE.md § 5 ("Jangan expose seluruh kolom spreadsheet ke API"),
Apps Script HANYA perlu mengembalikan kolom pada § 2 dan § 3 di atas —
bukan seluruh sheet mentah. Rekomendasi tambahan (opsional, didiskusikan
saat implementasi Apps Script sungguhan): NIK/No Rekening/NPWP bisa
di-mask di SISI SERVER (Apps Script) sebelum dikirim, bukan hanya di
client — lebih aman daripada mengirim nilai penuh lalu masking di UI
saja (pendekatan client-side saat ini).

## 7. Kontrak JSON yang Diharapkan (untuk Apps Script Web App)

Endpoint tunggal (`GET {VITE_API_URL}?resource=employees` dan
`?resource=leave`), format JSON, TIDAK butuh field yang tidak dipakai UI.

### `resource=employees` → `RemoteEmployeeRow[]`

```ts
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
  status: string // -> statusKepegawaian
  satker: string // -> satuanKerja
  bidangBagian?: string
  subBagian?: string
  nomorAbsensi?: string
  jenisKelamin?: 'L' | 'P'
  tempatLahir?: string
  tanggalLahir?: string // ISO YYYY-MM-DD
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
  statusAktif?: boolean // lihat § 2 catatan - belum ada sumber pasti
}
```

### `resource=leave` → `RemoteLeaveYearRow[]` (long format)

```ts
interface RemoteLeaveYearRow {
  nip: string
  nama: string
  unitKerja?: string
  tahun: number
  nMinus2?: number
  nMinus1?: number
  n?: number
}
```

Mapper client (`src/services/remoteDataSource.ts`) mengelompokkan array
ini per `nip` menjadi `LeaveRecord[]` (satu record per pegawai, berisi
array `nilaiTahunan`) — sesuai bentuk `LeaveRecord` yang sudah ada di
`src/types/leave.ts`, TIDAK ada perubahan pada type tersebut.

## 8. Opsi Integrasi & Rekomendasi

| Opsi | Keamanan | Kompleksitas | Kecocokan dengan arsitektur saat ini |
|---|---|---|---|
| **A. Google Apps Script Web App (doGet → JSON)** | Sedang — tidak ada credential rahasia sungguhan di frontend statis manapun (keterbatasan inheren static site), tapi bisa dikombinasikan dengan token sederhana di header/query yang divalidasi di sisi Apps Script untuk mengurangi akses sembarangan. Data minimization dilakukan di sisi Apps Script. | Rendah — tidak ada infra baru, sudah didokumentasikan di `docs/architecture.md` sejak Checkpoint 1. | **Cocok** — sesuai § 3 CLAUDE.md ("TIDAK ADA database server/Express/NestJS") |
| B. Google Sheets API v4 + Service Account | Baik SECARA TEKNIS, tapi service account key **tidak boleh** ada di frontend — butuh proxy server (mis. Cloudflare Worker) untuk menyembunyikannya | Sedang-tinggi — perlu infra tambahan (serverless function) | Melanggar § 3 CLAUDE.md tanpa diskusi eksplisit dulu |
| C. Publish sheet ke Web (CSV) + fetch langsung | **Buruk** — URL publik, siapapun dengan link bisa baca SEMUA kolom termasuk NIK/rekening/NPWP tanpa kontrol akses apapun | Sangat rendah | Tidak layak — data kepegawaian termasuk NIK/rekening/NPWP tidak boleh terbuka publik |
| D. SaaS pihak ketiga (Sheet.best, SheetDB, dll) | Buruk untuk data sensitif — data kepegawaian pemerintah melewati vendor eksternal, biasanya tetap butuh API key yang juga harus disembunyikan | Rendah, tapi menambah risiko vendor/data governance | Tidak direkomendasikan untuk data instansi pemerintah |

**Rekomendasi: Opsi A** — konsisten dengan `docs/architecture.md` yang
sudah ada sejak awal project, tidak menambah infrastruktur baru, dan
data minimization + masking bisa dilakukan di sisi Apps Script (§ 6).
Keterbatasan keamanan (tidak ada rahasia sungguhan di static frontend)
sudah didokumentasikan secara jujur di `docs/authentication.md` — model
keamanan realistis untuk fase ini adalah "token sederhana + validasi
server-side" untuk mengurangi akses sembarangan, BUKAN kerahasiaan
kriptografis penuh. Kontrol akses yang lebih kuat menyusul di
Checkpoint 5 lanjutan / Checkpoint 6 (auth pengguna divalidasi juga di
sisi Apps Script, bukan hanya `ProtectedRoute` di client).

## 9. Cara Mengaktifkan (setelah Apps Script benar-benar di-deploy)

Tidak ada perubahan kode diperlukan — cukup env var:

```bash
# .env (JANGAN commit)
VITE_API_URL=https://script.google.com/macros/s/XXXXX/exec
VITE_DATA_SOURCE=remote   # default 'mock' jika tidak diisi
```

Selama `VITE_DATA_SOURCE` tidak diisi/bukan `remote`, aplikasi berjalan
persis seperti sekarang (mock data, tanpa perubahan perilaku).

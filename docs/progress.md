# Project Progress

## Completed
- Checkpoint 5 (Persiapan) — Data Abstraction Layer untuk Integrasi
  Spreadsheet Online:
  - **Tujuan:** menyiapkan project agar sumber data bisa dipindah dari
    mock → spreadsheet online (Google Apps Script) TANPA membongkar
    UI/hook/komponen yang sudah ada. Ini PERSIAPAN, bukan integrasi
    yang sudah live — belum ada Apps Script sungguhan yang di-deploy
    atau diuji dengan data nyata.
  - **Analisis** (lengkap di `docs/spreadsheet-integration.md`):
    dependency map mock data (9 hook data, semua sudah lewat
    `services/api.ts` — hanya `useAuth` yang bypass, sengaja di luar
    cakupan tahap ini); mapping kolom sheet DUK → `Employee` &
    `LeaveRecord`; identifikasi bagian yang SENGAJA TIDAK dimigrasikan
    (`LeaveHistoryEntry`/`getLeaveHistory*`/`useLeaveList`/
    `useLeaveHistoryByEmployee`/`LeaveHistoryCard` — tidak ada kolom
    sumber di spreadsheet DAN sudah orphaned dari UI sejak Checkpoint
    A3; `mockLeaveTypeSummary`/`mockNipSedangCuti` — data contoh murni;
    data "Aktif Kerja" — belum ada type/UI sama sekali).
  - **Opsi integrasi dibandingkan** (§ 8 `docs/spreadsheet-integration.md`):
    Google Apps Script Web App (direkomendasikan — sesuai
    `docs/architecture.md` sejak awal, tanpa infra baru), Google Sheets
    API + Service Account (butuh proxy server tambahan), publish-to-web
    CSV (tidak aman — data NIK/rekening/NPWP jadi publik), SaaS pihak
    ketiga (risiko data governance). **Google Apps Script Web App
    dipilih.**
  - **`src/services/remoteDataSource.ts`** [BARU]: fetch wrapper ke
    Apps Script Web App (`VITE_API_URL`) + mapper dari kontrak JSON
    (`RemoteEmployeeRow[]`, `RemoteLeaveYearRow[]` — didokumentasikan
    penuh di `docs/spreadsheet-integration.md` § 7) ke type `Employee`/
    `LeaveRecord` yang SUDAH ADA — tidak ada perubahan pada
    `types/employee.ts` atau `types/leave.ts`. Baris cuti long-format
    (satu baris per pegawai per tahun) dikelompokkan per NIP di sisi
    client menjadi bentuk `LeaveRecord` yang sama persis dengan mock.
    Catatan: `statusAktif` (Employee) masih belum punya sumber kolom
    terkonfirmasi (temuan audit sebelumnya) — mapper default `true`
    kecuali Apps Script mengirim nilainya eksplisit, WAJIB ditinjau
    Checkpoint 4.
  - **`src/services/api.ts`** [DIUBAH — internal only]: ditambah
    `getRawEmployees()`/`getRawLeaveRecords()` sebagai satu-satunya
    tempat yang tahu sumber data (mock vs remote, dipilih dari env var
    `VITE_DATA_SOURCE`, default `'mock'`). SEMUA fungsi yang diekspor
    (`getEmployees`, `searchEmployees`, `getEmployeeByNip`,
    `getLeaveRecords`, `getLeaveSummaryByNip`, `getDashboardSummary`,
    `getLeaveYearAggregate`, `getEmployeeChartData`, dst.) — nama,
    signature, DAN urutan/logika bisnisnya TIDAK berubah, hanya sumber
    array mentahnya. `getLeaveHistory`/`getLeaveHistoryByNip`/
    `getLeaveTypeSummary` sengaja TETAP mock langsung (lihat alasan di
    atas).
  - **`src/vite-env.d.ts`** [BARU]: deklarasi tipe `ImportMetaEnv`
    (`VITE_API_URL`, `VITE_DATA_SOURCE`) — sebelumnya belum ada
    meskipun `.env.example` sudah mereferensikan `VITE_API_URL` sejak
    Checkpoint 1 (oversight lama, diperbaiki di sini agar
    `import.meta.env` type-safe).
  - **`.env.example`** [DIUBAH]: tambah `VITE_DATA_SOURCE=mock` dengan
    komentar penjelasan.
  - **`docs/spreadsheet-integration.md`** [BARU]: dokumen analisis +
    kontrak JSON lengkap (lihat isinya untuk detail mapping & keputusan
    keamanan).
  - **Verifikasi kompatibilitas**: dibandingkan checksum seluruh file
    di `src/hooks/`, `src/pages/`, `src/components/**` terhadap versi
    sebelum perubahan — **0 file berubah**. Tidak ada satu pun
    hook/halaman/komponen yang disentuh, sesuai instruksi "abstraction
    layer tanpa membongkar komponen UI".
  - **TIDAK dikerjakan tahap ini** (sesuai instruksi eksplisit):
    authentication/Supabase Auth, deployment, CRUD, penggantian mock
    data yang sudah ada, commit file `.xlsx` (tetap di `.gitignore`).
  - `npm install`/`npm run build` tidak bisa dijalankan di sandbox ini
    (registry npm diblokir, 403 — sama seperti checkpoint-checkpoint
    sebelumnya). Verifikasi manual dilakukan: keseimbangan
    kurung/kurawal/bracket per file baru/diubah, pengecekan field
    `Employee`/`LeaveRecord`/`LeaveYearValue` di mapper dicocokkan satu
    per satu terhadap definisi type, konfirmasi seluruh fungsi yang
    diekspor `api.ts` tetap dipakai hook yang sama dengan nama yang
    sama. **Wajib jalankan `npm install && npm run build` (dan
    `npm run lint`) di environment nyata sebelum mengaktifkan
    `VITE_DATA_SOURCE=remote` atau lanjut checkpoint berikutnya.**

- Checkpoint 3F — UI/UX Redesign v2 (Dark Mode, Semantic Colors, Logout
  Modal, Grouped Filters):
  - **Tujuan:** menindaklanjuti brief redesign baru dari pemilik project —
    "Modern Enterprise Dashboard / Premium Administrative System" dengan
    Light/Dark/System theme, palet warna semantic yang lebih variatif, dan
    beberapa perbaikan usability spesifik (Pegawai, Cuti, Logout). Tidak
    ada perubahan pada routing, business logic, struktur data, API, atau
    fitur yang sudah ada — murni styling/UX di atas komponen existing.
  - **Design tokens** (`src/index.css`, `tailwind.config.ts`): palet warna
    diselaraskan persis dengan brief (Primary `#3155C7`, Background
    `#F5F7FB`, Text Primary `#172033`, Text Secondary `#64748B`, Border
    `#CBD5E1`-ish). `success` diganti jadi Emerald `#10B981`, `destructive`
    diganti jadi Red `#EF4444`, ditambah token baru `violet` (`#8B5CF6`)
    dan `orange` (`#F97316`) di samping `cyan`/`warning` yang sudah ada —
    supaya chart & status bisa variatif tanpa didominasi biru (sesuai
    brief § 2). **Masih TIDAK ADA gradient** di mana pun (CLAUDE.md § 4
    tetap dipertahankan, konsisten dengan keputusan Checkpoint 3E).
  - **Dark Mode** [BARU]: `.dark` class di `src/index.css` dengan token
    dark charcoal/slate (Background `#0F172A`, Surface `#1E293B`,
    Secondary Surface `#243247`, Border `#334155`, sesuai brief § 3).
    TIDAK memakai filter/invert — murni CSS variables yang di-switch.
    `src/hooks/useTheme.tsx` [BARU]: Context Provider kecil & mandiri
    (Light/Dark/System) — sengaja terpisah dari pola `useAuth` (yang
    memang bukan Context by design, lihat `docs/authentication.md`)
    karena toggle tema butuh reaktif lintas komponen. Preferensi
    disimpan di `localStorage` key `ppsdmpu_theme` (§ 3 brief: "simpan
    pilihan theme menggunakan localStorage"). `src/main.tsx` dibungkus
    `<ThemeProvider>`. `index.html` mendapat inline script kecil untuk
    menerapkan class `.dark` SEBELUM React mount (mencegah flash tema
    salah saat reload). `src/components/layout/ThemeToggle.tsx` [BARU]:
    segmented control Light/Dark/System (ikon Sun/Moon/Monitor) di
    `Header`. Semua komponen (Card, Button, Input, Select, Badge, table,
    modal, chart, dsb.) otomatis mendukung dark mode karena sudah
    memakai token `hsl(var(--x))` sejak awal — tidak perlu di-hardcode
    ulang, kecuali beberapa style inline di chart Recharts yang memang
    sudah memakai `hsl(var(--card))`/`hsl(var(--border))` (otomatis ikut).
  - **Modal Konfirmasi Logout** [BARU] (brief § 10): `src/components/ui/dialog.tsx`
    — wrapper shadcn-style di atas `@radix-ui/react-dialog` (sudah ada di
    `package.json` sejak awal, baru dipakai sekarang — tidak ada
    dependency baru). `src/components/layout/LogoutDialog.tsx` [BARU]
    dengan copy persis sesuai brief ("Apakah Anda yakin ingin logout?" /
    "Anda akan keluar dari sesi saat ini." / tombol "Batal" & "Ya,
    Logout"). `Sidebar.tsx`: tombol Logout sekarang membuka dialog ini
    dulu — logout & redirect ke `/login` hanya terjadi setelah user
    menekan "Ya, Logout". Warna merah (`destructive`) HANYA dipakai pada
    tombol ini, sesuai brief § 11.
  - **Dashboard**: `StatCard` tone diperluas dengan `violet`/`orange`
    (di samping `primary`/`success`/`warning`/`cyan` yang sudah ada) agar
    4 kartu Ringkasan tidak didominasi satu warna (Total Pegawai=violet,
    PNS=primary/blue, PPPK=success/emerald, Total Cuti=warning/amber).
    `StatusKepegawaianChart` donut PPPK diselaraskan jadi emerald (sama
    dengan badge status di tabel Pegawai). `CutiSummaryCard`: angka
    N-2/N-1/N sekarang diberi label satuan "hari" (konsisten dengan
    halaman Cuti).
  - **Halaman Pegawai**: `EmployeeFilters` ditata ulang jadi dua panel
    terpisah dengan heading & latar berbeda dari background halaman —
    "Pencarian" (Cari Nama, Cari NIP) dan "Filter" (Status Kepegawaian,
    Satker, Bidang/Bagian) — sesuai brief § 5 ("jangan membuat semua
    input terlihat seperti satu area putih kosong"). `useEmployeeList`
    ditambah field baru `summary` (total/PNS/PPPK dari SELURUH data,
    dihitung dari `statusKepegawaian` yang sudah ada — bukan data baru,
    bukan perubahan pada field/return lama) untuk summary strip 3-kolom
    di atas tabel (brief § 5: "Tambahkan summary kecil: Total Pegawai,
    PNS, PPPK"). `EmployeeTable`: baris tabel diberi alternating
    background tipis (odd/even) untuk keterbacaan (brief § 6).
  - **Detail Pegawai**: `DetailRow` di `EmployeeDetailSections.tsx`
    diubah agar setiap value field punya batas jelas (border tipis +
    latar slate sangat ringan `bg-muted/50`), sesuai brief § 7 ("Setiap
    field harus memiliki ... border/input boundary yang jelas").
    Semua field di aplikasi ini memang read-only (tidak ada CRUD di
    frontend, lihat CLAUDE.md § 1) sehingga tidak ada varian "editable
    field" yang perlu dibedakan.
  - **Halaman Cuti**: `LeaveYearTable` header kolom diubah urutannya
    dari "N-2 (2024)" menjadi "2024 (N-2)" (tahun di depan, N-2/N-1/N
    sebagai label sekunder) sesuai contoh eksplisit di brief § 8–9.
    Nilai ditampilkan sebagai "5 hari" (bukan angka polos), dan nilai
    kosong sebagai "—" (em dash, bukan "-") sesuai brief § 9 ("Jika
    nilai tidak tersedia, tampilkan '—', bukan membuat angka sendiri").
    Angka dibuat lebih tegas (`font-medium tabular-nums`) + alternating
    row background. `LeaveSummaryCard` (Detail Pegawai) disamakan:
    nilai kosong juga "—" (sebelumnya "-").
  - **Tidak diubah:** routing (`App.tsx`), auth (`useAuth`,
    `authUsers.ts`), semua service layer & hooks data (kecuali
    penambahan field `summary` non-breaking di `useEmployeeList`), semua
    types, semua mock data, struktur/kolom tabel, filter/pagination
    logic, arti bisnis N-2/N-1/N (tetap "BELUM DIKONFIRMASI", tidak ada
    rumus baru ditambahkan).
  - **Hasil `npm run build`:** **BELUM dijalankan** di sesi ini —
    sandbox chat ini tidak punya akses network (`npm install` gagal 403,
    registry npm diblokir — sama seperti checkpoint-checkpoint
    sebelumnya, lihat "Known Issues"). Verifikasi manual yang dilakukan:
    (1) pengecekan keseimbangan kurung/kurawal/braket otomatis di semua
    file yang diedit/dibuat, (2) resolusi semua import lokal (`@/...`)
    terhadap file yang benar-benar ada di filesystem — tidak ada import
    yang salah alamat, (3) pengecekan manual bahwa setiap import baru
    (ikon Lucide, komponen) benar-benar dipakai (mengantisipasi
    `noUnusedLocals`/`noUnusedParameters` yang aktif di
    `tsconfig.app.json`). **Ini BUKAN pengganti `tsc`/`vite build`
    sungguhan — WAJIB dijalankan di environment nyata sebelum lanjut.**

- Checkpoint 3E — UI/UX Redesign (Modern Premium Enterprise + Soft UI):
  - **Tujuan:** redesign visual seluruh aplikasi (bukan business logic/data)
    ke arah "Modern Premium Enterprise + Soft UI + Layered Depth + aksen
    glass tipis", sesuai brief pemilik project. Tidak ada perubahan pada
    routing, auth, data mapping, atau mock data.
  - **Catatan penting — konflik aturan:** `CLAUDE.md § 4` melarang gradient
    dalam bentuk apa pun. Brief redesign baru mengizinkan gradient selama
    bukan "full gradient" dan glassmorphism sebagai aksen kecil. Keputusan
    yang diambil: **tetap tidak ada gradient sama sekali** (aturan lama yang
    lebih ketat dipertahankan) — kedalaman visual dibangun lewat layered
    shadow (`shadow-card`, `shadow-card-hover`, `shadow-popover`) dan
    border tipis, bukan gradasi warna. Aksen "glass" dibatasi HANYA pada
    `Header` (`.glass-surface` = transparansi + backdrop-blur, bukan
    gradient), sesuai batas "aksen kecil, bukan seluruh interface" dari
    brief. **Perlu dikonfirmasi ulang oleh pemilik project** apakah
    pendekatan ini sudah sesuai atau ingin melonggarkan aturan no-gradient
    di `CLAUDE.md`.
  - **Design tokens** (`src/index.css`, `tailwind.config.ts`): palet warna
    diganti total sesuai brief (Primary `#3155C7`, Primary Hover `#2646B0`,
    Soft Blue `#EAF0FF`, Cyan `#06B6D4`, Success `#16A36A`, Warning
    `#F59E0B`, Danger `#E05252`, Background `#F6F8FC`, Card `#FFFFFF`, Text
    `#1E293B`, Secondary Text `#64748B`, Border `#E2E8F0`) — dikonversi ke
    HSL agar tetap kompatibel dengan pola `hsl(var(--x))` yang sudah ada.
    `--radius` dinaikkan (0.5rem → 0.875rem) untuk kesan lebih premium.
    Font `Plus Jakarta Sans` + `Inter` ditambahkan via Google Fonts link di
    `index.html` (tidak ada dependency npm baru). Token baru: `primary-hover`,
    `primary-soft`, `cyan`, shadow layered (`card`, `card-hover`, `soft`,
    `popover`), utility `.glass-surface` dan `.scrollbar-none`.
  - **Komponen UI dasar** (`src/components/ui/`): `Card` (rounded-xl, layered
    shadow, prop baru `interactive` untuk hover-lift ringan), `Button` (radius
    lebih besar, hover ke `primary-hover`/soft-blue, `active:scale-[0.98]`),
    `Badge` (pill rounded-full, tone `secondary` → soft-blue), `Input`/`Select`
    (radius lebih besar, focus ring soft-blue, shadow tipis) — semua API
    (props) tidak berubah, tidak ada pemanggil yang perlu disesuaikan.
  - **Sidebar & Header** (`src/components/layout/`): diganti dari dominan
    navy solid menjadi light/white surface. `Sidebar`: active state soft-blue
    dengan indikator titik, label section "Menu", hover state lebih lembut.
    `Header`: sticky + aksen glass tipis (`.glass-surface`), avatar inisial
    user. `AppShell`: background & padding desktop diperbesar. Routing,
    struktur navigasi, dan fungsi logout tidak diubah.
  - **Dashboard** (`src/pages/Dashboard.tsx` + komponen dashboard): `StatCard`
    dirombak (chip ikon soft-tone, angka lebih besar & di-format
    `toLocaleString('id-ID')`, hover lift, tone baru `cyan` untuk PPPK,
    `success` untuk PNS). Semua chart Recharts (`HorizontalBarChart`,
    `StatusKepegawaianChart`, `PendidikanChart`) dipertahankan jenisnya
    (bar/donut sesuai kecocokan data — tidak dijadikan semua donut), warna
    diselaraskan ke token baru, ditambah `CartesianGrid` tipis pada bar
    chart, `cornerRadius` pada donut, tooltip dengan shadow lebih halus.
    `CutiSummaryCard` & `EmployeeQuickSearch` — polish visual saja (radius,
    hover state), disclaimer N-2/N-1/N tetap tidak diubah kata-katanya.
  - **Pegawai, Detail Pegawai, Cuti**: konsistensi visual diterapkan setelah
    Dashboard tervalidasi — heading halaman diperbesar (`text-2xl font-bold`),
    header tabel (`EmployeeTable`, `LeaveYearTable`) & row hover diselaraskan
    dengan token baru, avatar chip di `EmployeeDetail` ke soft-blue, catatan
    konteks di `Leave.tsx` diberi aksen soft-blue. **Tidak ada perubahan**
    pada fungsi, data, filter, pagination, atau business logic di halaman
    manapun.
  - **Tidak diubah:** routing (`App.tsx`), auth (`useAuth`, `authUsers.ts`),
    semua hooks & service layer, semua types, semua mock data, `Login.tsx`
    (di luar cakupan instruksi — otomatis mewarisi token baru tanpa
    diedit langsung).
  - **Hasil `npm run build`:** sukses, exit 0, tanpa error TypeScript.
    Dijalankan langsung di environment ini (`npm install` + `npm run build`
    + `npm run lint` berhasil dieksekusi — bukan hanya pengecekan manual).
    `npm run lint`: 1 error + 1 warning, **keduanya pre-existing** dari
    sebelum Checkpoint 3E (require() style import di `tailwind.config.ts`
    untuk `tailwindcss-animate`, dan react-refresh warning di `button.tsx`
    karena `buttonVariants` ikut di-export) — bukan regresi baru.

- Checkpoint 3D — Dashboard Redesign (Modern Enterprise Government Dashboard):
  - **File diubah:**
    - `src/types/dashboard.ts` — `DashboardSummary` diperluas dengan
      `totalPNS`/`totalPPPK` (dihitung dari `Employee.statusKepegawaian`
      yang sudah ada, bukan data baru); tipe baru `LeaveYearAggregate`
      untuk agregat N-2/N-1/N per tahun.
    - `src/services/api.ts` — `getDashboardSummary()` diperluas
      (totalPNS/totalPPPK); fungsi baru `getLeaveYearAggregate(tahun)`
      yang menjumlahkan `LeaveRecord.nilaiTahunan` (N-2/N-1/N) lintas
      pegawai untuk satu tahun — murni agregasi dari data yang sudah
      ada di `mockLeaveRecords`, tidak ada mock data baru.
    - `src/hooks/useDashboardSummary.ts` — juga mengambil
      `getLeaveYearAggregate(tahun berjalan)` dan mengembalikan
      `leaveYearSummary`.
    - `src/components/dashboard/StatCard.tsx` — polish visual (icon
      chip `rounded-lg`, opsional prop `hint`), API lama (`label`,
      `value`, `icon`, `tone`) tetap kompatibel — tidak ada pemanggil
      lain yang perlu diubah.
    - `src/pages/Dashboard.tsx` — ditata ulang: Section "Ringkasan" (4
      stat card: Total Pegawai, Pegawai PNS, Pegawai PPPK, Total Cuti
      contoh) → strip "Informasi Cepat" (Pegawai Aktif, Pegawai Sedang
      Cuti — dipindah dari stat card besar ke strip ringkas) → Section
      "Distribusi Kepegawaian" (Donut Status + Bar Golongan, Bar Satker
      + Bar Bidang/Bagian — tidak diubah dari checkpoint sebelumnya) →
      Section "Cuti & Informasi Lainnya" (CutiSummaryCard baru + Donut
      Pendidikan, lalu Cari Pegawai).
  - **File baru:**
    - `src/components/dashboard/CutiSummaryCard.tsx` — menampilkan
      agregat N-2/N-1/N (tahun berjalan) dari `LeaveYearAggregate`.
      **Tidak** menjumlahkan N-2+N-1+N menjadi klaim "saldo cuti" —
      hanya menampilkan tiga angka mentah + jumlah pegawai yang
      tercatat, dengan disclaimer eksplisit (pola sama seperti
      `LeaveSummaryCard` di Detail Pegawai) bahwa arti bisnis N-2/N-1/N
      masih belum dikonfirmasi (lihat `docs/data-mapping.md`).
  - **Chart yang dipakai (semua Recharts, tidak ada library baru):**
    Donut/Pie (`StatusKepegawaianChart`, `PendidikanChart`) dan
    Horizontal Bar (`HorizontalBarChart`, dipakai ulang untuk Golongan/
    Satker/Bidang) — semuanya sudah ada sejak checkpoint sebelumnya,
    tidak dibuat ulang.
  - **Sumber data:** seluruhnya dari `mockEmployees` (statistik &
    chart kepegawaian) dan `mockLeaveRecords` (agregat N-2/N-1/N) yang
    sudah ada — tidak ada angka fiktif/hardcode.
  - **Tidak diubah:** routing, `AppShell`/`Header`/`Sidebar`,
    `EmployeeTable`/`EmployeeFilters`/halaman Pegawai, `EmployeeDetail`,
    halaman Cuti (`Leave.tsx`, `LeaveYearTable`, dll), authentication,
    `types/employee.ts`, `types/leave.ts`. `LeaveTypeChart.tsx` tetap
    ada di project (tidak dihapus) namun sengaja tidak dipasang di
    Dashboard baru ini — lihat catatan di "Known Issues" di bawah.
  - **Hasil `npm run build`:** BELUM dijalankan di sesi ini (sandbox
    chat tanpa akses network — lihat "Known Issues"). **Wajib
    dijalankan di environment nyata sebelum lanjut ke checkpoint
    berikutnya.**

- Checkpoint 1 — Foundation:
  - Struktur project React + Vite + TypeScript
  - Tailwind CSS + design tokens solid (no gradient)
  - React Router v6 dengan `ProtectedRoute`
  - Struktur folder sesuai `CLAUDE.md § 6`
  - ESLint (flat config)
  - Service layer `src/services/api.ts` (mock data)
  - Draft types `Employee` & `LeaveRecord`
  - Mock data dummy (`src/mock/`)
  - `CLAUDE.md`, `README.md`, dokumentasi awal
  - `npm run dev` & `npm run build` diverifikasi sukses (dilaporkan oleh
    pemilik project); `@types/node` ditambahkan untuk kebutuhan
    `vite.config.ts`

- Checkpoint 2 — UI Foundation:
  - Halaman Login penuh (`src/pages/Login.tsx`): identitas PPSDMPU,
    field Username/NIP & Password, toggle show/hide password, validasi
    field wajib, pesan error jelas (kosong maupun salah credential),
    loading state saat submit, redirect otomatis ke `/dashboard`
    (atau halaman asal) jika sudah login
  - Mock authentication: `src/mock/authUsers.ts` (akun demo, didokumentasikan
    eksplisit sebagai non-sensitif/non-production) + `useAuth.login()`
    yang memvalidasi credential dan menyimpan session ke `sessionStorage`
  - Session bertahan saat refresh halaman (selama tab masih terbuka)
  - `ProtectedRoute` menyimpan lokasi asal (`state.from`) untuk redirect
    kembali setelah login
  - `AppShell` layout (Header + Sidebar responsif + mobile overlay nav)
    membungkus semua halaman protected; navigasi Dashboard/Pegawai/Cuti
    dan tombol Logout yang menghapus session lalu redirect ke `/login`
  - Komponen UI dasar reusable: `Button`, `Input`, `Label`
    (`src/components/ui/`) — warna solid, tanpa gradient, accessible
    (label terhubung via `htmlFor`, `aria-invalid`, `aria-describedby`,
    `role="alert"` pada pesan error)
  - Routing yang sudah ada dipertahankan; hanya menambahkan layer
    `AppShell` di dalam `ProtectedRoute`, tidak mengubah path/struktur route

- Checkpoint 3A — Dashboard:
  - Halaman `src/pages/Dashboard.tsx` diisi penuh (sebelumnya placeholder):
    4 kartu ringkasan (Total Pegawai, Pegawai Aktif, Pegawai Sedang Cuti,
    Total Cuti), Quick Search pegawai (nama/NIP, case-insensitive, tombol
    "Lihat Detail" ke `/pegawai/:nip`), dan chart Recharts "Rekap Cuti
    Berdasarkan Jenis" (judul, tooltip, label jelas)
  - Komponen baru: `src/components/ui/card.tsx` (primitive Card, solid
    color, tanpa gradient), `src/components/dashboard/StatCard.tsx`,
    `src/components/dashboard/LeaveTypeChart.tsx`,
    `src/components/dashboard/EmployeeQuickSearch.tsx` — masing-masing
    punya loading state (skeleton) dan empty/error state sesuai kebutuhan
  - Arsitektur UI → Hook → Service → Mock Data dipertahankan:
    `src/hooks/useDashboardSummary.ts` &
    `src/hooks/useEmployeeSearch.ts` (hook baru) memanggil
    `src/services/api.ts` (`getDashboardSummary`, `getLeaveTypeSummary`,
    `searchEmployees` — fungsi baru; `getDashboardStatistics` lama
    diganti `getDashboardSummary` yang sebelumnya belum dipakai di mana
    pun); komponen tidak mengambil mock data langsung
  - Types baru `src/types/dashboard.ts` (`DashboardSummary`,
    `LeaveTypeSummaryItem`) — terpisah dari `types/leave.ts` (N-2/N-1/N)
    agar tidak menyentuh/menebak arti bisnis cuti yang belum
    dikonfirmasi (lihat `docs/data-mapping.md`); jenis cuti
    (Tahunan/Sakit/Melahirkan/Besar) di chart murni data contoh
  - Mock data ditambah secukupnya: beberapa pegawai contoh baru di
    `src/mock/employees.ts` (untuk demo Quick Search; pegawai contoh 001
    yang dipakai akun demo login Checkpoint 2 tidak diubah) dan
    `mockLeaveTypeSummary` / `mockNipSedangCuti` baru di
    `src/mock/leave.ts`
  - Auth, routing, `Header`, `Sidebar`, `AppShell`, dan Logout dari
    Checkpoint 1–2 tidak diubah

- Checkpoint 3B — Pegawai + Detail Pegawai:
  - `src/pages/Employees.tsx` diisi penuh (sebelumnya placeholder):
    tabel daftar pegawai (Nama, NIP, Jabatan, Unit Kerja, Status, Aksi),
    pencarian Nama & NIP terpisah (case-insensitive), filter Unit Kerja
    (dropdown diturunkan dari data), filter Status (Aktif/Tidak Aktif),
    dan pagination (5 baris/halaman) dengan tombol Sebelumnya/Berikutnya
  - `src/pages/EmployeeDetail.tsx` diisi penuh (sebelumnya placeholder):
    menampilkan Nama, NIP, Jabatan, Unit Kerja, Status Kepegawaian
    (+ badge Aktif/Tidak Aktif) dalam layout yang mudah dibaca; tombol
    "Kembali ke Daftar Pegawai" ke `/pegawai`; jika NIP tidak ditemukan
    di data mock, tampil pesan "Data pegawai tidak ditemukan." + tombol
    kembali
  - Loading state (skeleton), error state, dan empty state ditambahkan
    di kedua halaman
  - Komponen baru: `src/components/employee/EmployeeFilters.tsx`,
    `EmployeeTable.tsx`, `EmployeePagination.tsx`; primitive UI baru
    `src/components/ui/select.tsx` (native `<select>` bergaya, bukan
    Radix — menghindari setup baru) dan `src/components/ui/badge.tsx`
    (badge status, warna solid)
  - Arsitektur UI → Hook → Service → Mock Data dipertahankan: hook baru
    `src/hooks/useEmployeeList.ts` (fetch via `getEmployees()`, lalu
    search/filter/pagination di sisi client) dan
    `src/hooks/useEmployeeDetail.ts` (fetch via `getEmployeeByNip()`);
    tidak ada perubahan pada `src/services/api.ts` atau
    `src/mock/employees.ts` — keduanya sudah punya fungsi yang
    dibutuhkan sejak Checkpoint 3A
  - Tidak mengerjakan halaman Cuti/Riwayat Cuti, N-2/N-1/N, Logout
    Modal, integrasi Google Spreadsheet, atau Checkpoint 3C/3D/4 —
    sesuai batasan checkpoint ini
  - Dashboard, routing (`App.tsx`), `AppShell`/`Header`/`Sidebar`, dan
    auth dari checkpoint sebelumnya tidak diubah

- Checkpoint 3C — Cuti (halaman Cuti + Ringkasan Cuti & Riwayat Cuti
  di Detail Pegawai):
  - `src/pages/Leave.tsx` diisi penuh (sebelumnya placeholder): tabel
    Nama Pegawai, NIP, Jenis Cuti, Periode, Jumlah Hari, Status;
    pencarian Nama & NIP terpisah (case-insensitive); filter Jenis
    Cuti, Status, dan Tahun (dropdown diturunkan dari data); pagination
    (5 baris/halaman)
  - `src/pages/EmployeeDetail.tsx` DITAMBAHKAN dua bagian baru di
    bawah kartu detail yang sudah ada dari Checkpoint 3B (kartu Nama/
    NIP/Jabatan/Unit Kerja/Status Kepegawaian TIDAK diubah):
    - **"Ringkasan Cuti"**: menampilkan N-2 (2024), N-1 (2025), N
      (2026) sebagai tiga baris terpisah, ditambah **Total Cuti = N-2
      + N-1 + N** yang dihitung dinamis di komponen UI (bukan field
      tersimpan). Total Cuti diberi catatan eksplisit bahwa ini BUKAN
      "Sisa Cuti" dan bukan saldo yang otomatis dapat digunakan.
      Nilai tahun yang kosong ditampilkan "-"; jika pegawai belum
      punya data ringkasan sama sekali, tampil pesan "Belum terdapat
      data ringkasan cuti untuk pegawai ini." Asumsi lengkap
      didokumentasikan di `docs/data-mapping.md` § 4.
    - **"Riwayat Cuti"**: tabel Periode, Jenis Cuti, Jumlah Hari,
      Status per pengajuan cuti pegawai tsb.; jika kosong tampil
      "Belum terdapat riwayat cuti."
  - Komponen baru: `src/components/leave/LeaveFilters.tsx`,
    `LeaveTable.tsx`, `LeavePagination.tsx` (untuk halaman `/cuti`),
    `LeaveSummaryCard.tsx` & `LeaveHistoryCard.tsx` (untuk Detail
    Pegawai)
  - Arsitektur UI → Hook → Service → Mock Data dipertahankan: hook
    baru `src/hooks/useLeaveList.ts` (halaman `/cuti`),
    `useLeaveSummary.ts` (Ringkasan Cuti — juga menyimpan konstanta
    `TAHUN_BERJALAN = 2026`), `useLeaveHistoryByEmployee.ts` (Riwayat
    Cuti) — semuanya memanggil fungsi baru di `src/services/api.ts`
    (`getLeaveHistory`, `getLeaveHistoryByNip`, `getLeaveSummaryByNip`;
    fungsi lama `getLeaveData`/`getDashboardSummary`/dst tidak diubah)
  - Types baru (menambah, bukan mengubah, `src/types/leave.ts`):
    `LeaveHistoryEntry`, `StatusCuti` — terpisah secara eksplisit dari
    `LeaveYearValue`/`LeaveRecord` (N-2/N-1/N) yang statusnya tetap
    "belum dikonfirmasi" sejak Checkpoint 1
  - Mock data baru di `src/mock/leave.ts`: `mockLeaveHistory` (riwayat
    per transaksi, mencakup pegawai tanpa riwayat untuk uji empty
    state) + beberapa entri baru di `mockLeaveRecords` (termasuk nilai
    tahun yang sengaja kosong/`undefined` dan satu pegawai tanpa data
    sama sekali, untuk uji penanganan null/kosong); 2 entri
    `mockLeaveRecords` asli dari Checkpoint 1 tidak diubah
  - `docs/data-mapping.md` diperbarui (§ 4, baru) untuk
    mendokumentasikan asumsi UI Checkpoint 3C secara eksplisit: Total
    Cuti adalah operasi tampilan (sum), bukan klaim arti bisnis
    N-2/N-1/N yang masih menunggu konfirmasi Checkpoint 4
  - Tidak mengerjakan Checkpoint 3D atau Checkpoint 4, tidak ada
    integrasi Google Spreadsheet — sesuai batasan checkpoint ini
  - Dashboard, halaman Pegawai, routing, layout, dan auth dari
    checkpoint sebelumnya tidak diubah

- Checkpoint A1 — Revisi Menu Pegawai (menyesuaikan struktur `DUK_Copy.xlsx`):
  - `src/types/employee.ts`: `EmployeeListItem` diubah — `satker` dan
    `bidangBagian` sekarang field TERPISAH (tidak lagi digabung jadi
    `unitKerja`), tambah `golongan`, hapus `statusAktif` (boolean) dari
    item tabel Pegawai. `Employee` (dipakai Detail Pegawai/Dashboard)
    TIDAK diubah.
  - `src/services/api.ts`: `toEmployeeListItem` disesuaikan dengan
    struktur `EmployeeListItem` baru; `getEmployees`/`searchEmployees`
    tidak berubah secara struktural (masih dipakai Dashboard Quick
    Search tanpa masalah — komponen itu hanya memakai `nip`/`nama`).
  - `src/hooks/useEmployeeList.ts`: filter `unitKerjaFilter` +
    `statusFilter` (boolean aktif) diganti tiga filter terpisah:
    `satkerFilter`, `bidangFilter`, `statusFilter` (Status Kepegawaian,
    nilai string dinamis dari data — BUKAN lagi boolean aktif/tidak
    aktif). Opsi dropdown (`satkerOptions`, `bidangOptions`,
    `statusOptions`) diturunkan otomatis dari data.
  - `src/pages/Employees.tsx` & `src/components/employee/EmployeeFilters.tsx`:
    filter UI diperbarui — Cari Nama, Cari NIP, Status Kepegawaian,
    Satker, Bidang/Bagian (5 filter, semua terpisah sesuai spreadsheet
    asli).
  - `src/components/employee/EmployeeTable.tsx`: kolom tabel utama
    diubah jadi Nama, NIP, Jabatan, Golongan, Satker, Status
    Kepegawaian, Aksi (7 kolom, tetap ringkas). Badge status memakai
    nilai Status Kepegawaian (PNS/PPPK) apa adanya, bukan lagi label
    Aktif/Tidak Aktif. Nilai kosong ditampilkan `-`.
  - `src/mock/employees.ts`: ditambah 2 pegawai contoh (008, 009,
    data dummy) dengan Satker (`BPSDMP`), Bidang/Bagian
    (`Bidang Pelatihan`), dan Golongan yang berbeda agar filter baru
    bisa diuji dengan variasi data.
  - Dashboard, Menu Cuti, Detail Pegawai, Aktif Kerja, auth, routing,
    dan stack/dependency TIDAK diubah, sesuai batasan tugas A1.
  - `npm install`/`npm run build` tidak bisa dijalankan di sandbox ini
    (registry npm diblokir, 403). Sudah dilakukan verifikasi manual
    (keseimbangan kurung/kurawal per file, pencarian referensi lama
    `unitKerjaFilter`/`unitKerjaOptions`/`StatusAktifFilter`/
    `EmployeeListItem.statusAktif` di seluruh `src/` — tidak
    ditemukan sisa, konsisten). **Wajib jalankan `npm run build` &
    `npm run lint` di environment nyata sebelum lanjut ke tahap
    berikutnya.**

- Checkpoint A2 — Detail Pegawai (memperluas tampilan sesuai struktur DUK_Copy.xlsx):
  - `src/types/employee.ts`: `Employee` diperluas — ditambah field
    baru sesuai 4 kelompok data DUK: Data Kepegawaian (`tmtGolongan`,
    `tmtPengangkatan`, `tmtJabatan` — dipisah jelas dari field `tmt`
    lama; `pendidikanPengangkatan`, `nomorAbsensi`), Data Pribadi
    (`agama`, `gelarDepan`, `gelarBelakang`, `nik`, `alamat`), Data
    Pendidikan (`tingkatPendidikan`, `tahunLulus`), Data Kontak &
    Administratif (`emailPribadi`, `emailDinas`, `idBkn`, `kerpeg`,
    `noHp`, `namaRekening`, `noRekening`, `bank`, `npwp`). Field lama
    (`tmt`, `gelar`, `pendidikanTerakhir`, dst) dipertahankan dengan
    JSDoc `@deprecated` agar tidak merusak referensi lama.
    `EmployeeListItem` TIDAK diubah.
  - `src/mock/employees.ts`: seluruh 9 pegawai contoh diperbarui
    dengan field baru A2 (data dummy, pola `Pegawai Contoh 00X`).
    Beberapa field di pegawai 003, 006, 007 sengaja `undefined` untuk
    menguji tampilan "-". Tidak ada data pegawai asli.
  - `src/components/employee/EmployeeDetailSections.tsx` [BARU]: 4
    komponen section card — `SectionDataKepegawaian`,
    `SectionDataPendidikan`, `SectionDataPribadi`,
    `SectionDataKontakAdministratif`. Semua field
    undefined/kosong ditampilkan "-". Tidak ada logika bisnis baru.
  - `src/pages/EmployeeDetail.tsx`: diubah dari satu card menjadi
    layout multi-section. Header profil menampilkan nama lengkap +
    gelar, NIP, jabatan, badge Status Kepegawaian. Empat section card
    baru ditambahkan. `LeaveSummaryCard` & `LeaveHistoryCard`
    (Checkpoint 3C) tidak diubah dan tetap ada di bawah.
  - Dashboard, Menu Pegawai (A1), Menu Cuti, auth, routing,
    service layer, hooks (kecuali import section baru di halaman),
    dan dependency TIDAK diubah sesuai batasan A2.
  - `npm run build` (tsc -b && vite build) dan `npm run lint`
    (ESLint) `npm run build` sukses (exit 0, tsc-b && vite build
    tanpa error TypeScript). `npm run lint` keluar exit 1 karena 2
    issue PRE-EXISTING yang sudah ada sejak sebelum A2: (1) error
    `require()` di `tailwind.config.ts:64` (bukan file A2), (2)
    warning fast-refresh di `button.tsx:48` (bukan file A2). Tidak
    ada issue baru yang diperkenalkan oleh perubahan A2.

- Checkpoint A3 — Revisi Menu Cuti (sesuai struktur DUK_Copy.xlsx):
  - `src/mock/leave.ts`: `mockLeaveRecords` diperluas — setiap pegawai
    kini punya `nilaiTahunan` untuk rentang 2024–2033 (sesuai DUK).
    Nilai 2024–2026 diisi contoh angka dummy; 2027–2033 `undefined`
    untuk menguji tampilan "-". `mockLeaveHistory` dipertahankan di
    file (tidak dihapus) tapi tidak lagi dipakai oleh UI.
  - `src/services/api.ts`: ditambah fungsi `getLeaveRecords()` (baru)
    untuk mengambil `LeaveRecord[]` — dipakai hook A3. Fungsi lama
    tidak dihapus.
  - `src/hooks/useLeaveTable.ts` [BARU]: hook untuk halaman `/cuti`
    A3. Mengambil `LeaveRecord`, menyediakan filter Nama/NIP/Tahun
    (statis 2024–2033), pagination. Tidak ada filter Jenis/Status
    karena tidak tersedia di DUK.
  - `src/components/leave/LeaveYearTable.tsx` [BARU]: tabel kolom Nama,
    NIP, N-2 (tahun-2), N-1 (tahun-1), N (tahun). Nilai `undefined`
    ditampilkan "-".
  - `src/components/leave/LeaveYearFilters.tsx` [BARU]: filter Cari
    Nama, Cari NIP, Tahun (dropdown statis 2024–2033).
  - `src/pages/Leave.tsx`: ditulis ulang — judul "Nilai Cuti Tahunan",
    menggunakan komponen dan hook baru A3. Dilengkapi catatan konteks
    bahwa arti N-2/N-1/N belum dikonfirmasi. Filter lama (Jenis Cuti,
    Status) dihapus karena tidak ada sumbernya di DUK.
  - `src/components/leave/LeavePagination.tsx`: label teks diperbarui
    dari "data cuti" menjadi "pegawai".
  - `src/pages/EmployeeDetail.tsx`: `LeaveHistoryCard` dan import
    `useLeaveHistoryByEmployee` dihapus. `LeaveSummaryCard`
    (Ringkasan Cuti N-2/N-1/N) tetap ada — berasal dari `LeaveRecord`
    yang memang ada di DUK.
  - Komponen/hook lama (`LeaveFilters`, `LeaveTable`, `useLeaveList`,
    `LeaveHistoryCard`, `useLeaveHistoryByEmployee`) tidak dihapus dari
    filesystem — tetap ada tapi tidak lagi diimport dari halaman aktif.
  - `src/types/leave.ts` TIDAK diubah — `LeaveHistoryEntry`/`StatusCuti`
    dipertahankan agar tidak merusak backward compatibility.
  - Dashboard, Menu Pegawai (A1), Detail Pegawai (A2, selain penghapusan
    `LeaveHistoryCard`), auth, routing, dependency TIDAK diubah.
  - `npm run build` (tsc -b && vite build) sukses exit 0 tanpa error
    TypeScript. (2 issue lint pre-existing dari sebelum A3 tetap ada.)

## In Progress
- (belum ada — menunggu instruksi lanjut setelah Checkpoint A3)

## Pending
- Checkpoint 4 — Data mapping DUK final (konfirmasi arti bisnis
  N-2/N-1/N & kolom aktif kerja; tinjau ulang asumsi UI Checkpoint 3C
  di `docs/data-mapping.md` § 4 begitu jawaban tersedia — termasuk
  `CutiSummaryCard` baru di Checkpoint 3D yang juga menampilkan N-2/N-1/N)
- Checkpoint 5 — Integrasi Google Apps Script SUNGGUHAN (deploy Apps
  Script sesuai kontrak `docs/spreadsheet-integration.md` § 7, uji
  dengan `VITE_DATA_SOURCE=remote` + data nyata; abstraction layer di
  sisi React sudah siap — lihat Checkpoint 5 (Persiapan) di atas)
  termasuk mengganti mock auth dengan validasi login di sisi server
- Checkpoint 6 — Finalization (security/a11y/performance review, deployment)

## Known Issues
- Perubahan Checkpoint 3D (redesign Dashboard) juga ditulis di lingkungan
  tanpa akses network (sandbox chat tidak bisa `npm install`/`npm run
  build` — dicoba, 403 karena registry npm diblokir). Tidak ada
  dependency baru — tetap Recharts & Lucide yang sudah ada. Sudah
  dilakukan pengecekan manual (keseimbangan kurung/brace, semua import
  di `Dashboard.tsx` dicocokkan ke file yang benar-benar ada, tipe
  `DashboardSummary` dicek tidak dipakai di tempat lain yang bisa rusak
  akibat field baru, nama ikon Lucide `ShieldCheck`/`Briefcase`/
  `UserCheck`/`CalendarClock` adalah ikon umum) tapi ini BUKAN pengganti
  `tsc`/`vite build` sungguhan. **Wajib jalankan `npm run build` di
  environment nyata sebelum lanjut ke checkpoint berikutnya.**
- `LeaveTypeChart.tsx` (chart rekap jenis cuti contoh — Tahunan/Sakit/
  Melahirkan/Besar) tetap ada di project tapi sengaja TIDAK dipasang di
  Dashboard baru. Dashboard sekarang memprioritaskan `CutiSummaryCard`
  yang memakai N-2/N-1/N asli (sesuai instruksi Checkpoint 3D §5) supaya
  section "Cuti" tidak duplikatif dan tidak membuat halaman terlalu
  padat. `getLeaveTypeSummary()` & `leaveTypeData` di
  `useDashboardSummary` tetap dipertahankan (dipakai untuk stat card
  "Total Cuti (contoh)"), hanya chart barnya yang tidak ditampilkan.
- Perubahan Checkpoint 3C juga ditulis di lingkungan tanpa akses network
  (sandbox chat ini tidak bisa `npm install`/`npm run build`). Tidak ada
  dependency BARU yang ditambahkan. Sudah dilakukan pengecekan manual
  (keseimbangan kurung/brace, kecocokan nama export/import, path alias
  `@/*`, nama ikon Lucide yang dipakai — `CalendarOff`, `Info`, selain
  ikon yang sudah dipakai di checkpoint sebelumnya) tapi ini bukan
  pengganti `tsc`/`vite build` sungguhan. **Wajib jalankan `npm run
  build` (dan `npm run lint`) di environment nyata sebelum lanjut ke
  Checkpoint 3D.**
- "Total Cuti" di "Ringkasan Cuti" (Checkpoint 3C) adalah penjumlahan
  UI dari N-2+N-1+N, BUKAN konfirmasi bahwa penjumlahan ini punya arti
  bisnis HR tertentu — arti N-2/N-1/N sendiri masih "BELUM
  DIKONFIRMASI" (lihat `docs/data-mapping.md` § 2 & § 4). WAJIB
  ditinjau ulang begitu Checkpoint 4 mengonfirmasi arti sebenarnya —
  kemungkinan Total Cuti perlu diubah namanya, dihapus, atau diberi
  rumus berbeda.
- Perubahan Checkpoint 3B juga ditulis di lingkungan tanpa akses network
  (sandbox chat ini tidak bisa `npm install`/`npm run build`). Tidak ada
  dependency BARU yang ditambahkan — `select.tsx` sengaja pakai elemen
  `<select>` native (bukan `@radix-ui/react-select` yang sudah ada di
  `package.json` tapi belum pernah dipakai) supaya tidak perlu setup
  tambahan. Sudah dilakukan pengecekan manual (keseimbangan
  kurung/brace, kecocokan nama export/import, path alias `@/*`, nama
  ikon Lucide yang dipakai — `Search`, `ChevronDown`, `ChevronLeft`,
  `ChevronRight`, `ArrowLeft`, `User`, `Users`, semuanya sudah dipakai
  di checkpoint sebelumnya atau ikon dasar yang umum) tapi ini bukan
  pengganti `tsc`/`vite build` sungguhan. **Wajib jalankan `npm run
  build` (dan `npm run lint`) di environment nyata sebelum lanjut ke
  Checkpoint 3C/3D.**
- Perubahan Checkpoint 3A juga ditulis di lingkungan tanpa akses network
  (sandbox chat ini tidak bisa `npm install`/`npm run build` — dicoba,
  gagal 403 karena registry npm diblokir). Tidak ada dependency BARU
  yang ditambahkan — Recharts & Lucide sudah ada di `package.json`
  sejak Checkpoint 1. **Tetap wajib jalankan `npm run build` di
  environment nyata (Claude Code/VS Code Anda) untuk memvalidasi
  sebelum lanjut ke Checkpoint 3B.** Sudah dilakukan pengecekan manual
  (keseimbangan kurung/brace, kecocokan nama export/import, path alias
  `@/*`, nama ikon Lucide, kelas warna Tailwind terhadap
  `tailwind.config.ts`) tapi ini bukan pengganti `tsc`/`vite build`
  sungguhan.
- Perubahan Checkpoint 2 ditulis di lingkungan tanpa akses network
  (sandbox chat ini tidak bisa `npm install`/`npm run build`). Tidak ada
  dependency BARU yang ditambahkan — seluruh Radix primitives yang
  dipakai (`@radix-ui/react-slot`, `@radix-ui/react-label`) sudah ada di
  `package.json` sejak Checkpoint 1.
- `useAuth` bukan React Context (lihat `docs/authentication.md` §
  Catatan Implementasi) — logout dari `Sidebar` menavigasi eksplisit ke
  `/login` alih-alih mengandalkan re-render reaktif lintas komponen.
  Ini keputusan sadar untuk versi prototype, bukan bug, tapi dicatat
  untuk pertimbangan refactor di checkpoint mendatang jika diperlukan.
- shadcn/ui CLI (`npx shadcn@latest init`) belum dijalankan; komponen
  `Button`/`Input`/`Label` ditulis manual dengan pola yang kompatibel
  (cva + Radix + `cn()`) agar tidak bergantung pada akses network CLI.

## Next Step
1. Jalankan `npm install` (bila ada dependency baru dari lock file) lalu
   `npm run build` untuk Checkpoint 3F. Perbaiki error TypeScript jika
   ada, ulangi sampai `tsc -b && vite build` sukses exit 0. Jalankan juga
   `npm run lint`.
2. Jalankan `npm run dev` dan periksa:
   - Toggle Light/Dark/System di Header berfungsi, pilihan tersimpan
     setelah refresh (localStorage), dan TIDAK ada flash tema salah saat
     reload halaman.
   - Semua halaman (Login, Dashboard, Pegawai, Detail Pegawai, Cuti)
     tetap terbaca jelas & kontras cukup di kedua tema.
   - Tombol Logout di Sidebar memunculkan modal konfirmasi (bukan
     langsung logout); "Batal" menutup modal tanpa logout, "Ya, Logout"
     benar-benar logout & redirect ke `/login`.
   - Halaman Pegawai: summary strip (Total/PNS/PPPK) tampil sesuai data,
     filter terbagi visual jadi panel "Pencarian" dan "Filter".
   - Halaman Cuti: header kolom tabel format "2024 (N-2)", nilai
     tampil "X hari", nilai kosong tampil "—".
   - Dashboard: 4 stat card memakai warna berbeda-beda (tidak seluruhnya
     biru), donut Status Kepegawaian tetap benar (PNS biru, PPPK emerald).
   - Tidak ada error di console browser pada kedua tema.
3. Pastikan business logic, filter/pagination, dan seluruh data
   (mock/types) TIDAK berubah — Checkpoint 3F murni styling/UX.
4. Setelah tervalidasi, tunggu instruksi eksplisit dari pemilik project
   mengenai checkpoint berikutnya (mis. Checkpoint 4 — konfirmasi arti
   bisnis N-2/N-1/N).

---

1. Uji manual halaman `/cuti` (Checkpoint A3):
   - Harus tampil tabel dengan kolom: Nama Pegawai, NIP, N-2, N-1, N.
   - Filter Tahun berisi 2024–2033; ubah tahun → nilai kolom berubah.
   - Cari nama/NIP → tabel terfilter.
   - Nilai `undefined` tampil "-" (tahun 2027–2033 pegawai mana pun).
   - Filter lama (Jenis Cuti, Status) tidak lagi ada.
2. Uji Detail Pegawai:
   - "Ringkasan Cuti" N-2/N-1/N masih tampil.
   - "Riwayat Cuti" sudah tidak muncul.
3. Pastikan Menu Pegawai (A1) dan Dashboard tidak terpengaruh.
4. Setelah tervalidasi, tunggu instruksi eksplisit dari pemilik project
   mengenai checkpoint berikutnya.

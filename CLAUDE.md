# CLAUDE.md — Konteks Project untuk Claude / Claude Code

Baca file ini terlebih dahulu sebelum mengerjakan apa pun di project ini.
Sesi/akun Claude yang berbeda harus dapat memahami project hanya dari file ini.

## 1. Tujuan Project

Website internal **Sistem Informasi Kepegawaian PPSDMPU** — dashboard
**read-only** untuk menampilkan data kepegawaian & cuti berdasarkan data
DUK (Daftar Urut Kepangkatan), yang aslinya dikelola di Google Spreadsheet.

Pengguna dashboard TIDAK BISA tambah/edit/hapus data. Semua pengelolaan
data tetap lewat spreadsheet oleh petugas.

## 2. Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (komponen di `src/components/ui`, ditambahkan
  satu per satu sesuai kebutuhan — belum semua di-generate di Checkpoint 1)
- React Router v6
- Lucide React (icon)
- Recharts (grafik, jika diperlukan)
- Data: Google Spreadsheet → Google Apps Script → JSON API
- Hosting: Vercel atau Cloudflare Pages (statis)

**TIDAK ADA** database server (Postgres/MySQL/Mongo), **TIDAK ADA**
Express/NestJS/Next.js. Arsitektur ini jangan diubah tanpa alasan kuat
yang didiskusikan & didokumentasikan dulu.

## 3. Arsitektur

```
Google Spreadsheet → Google Apps Script → JSON API → React + Vite → Static Hosting
```

Tidak ada backend server custom. Semua "backend" adalah Google Apps Script
Web App yang membaca sheet dan mengembalikan JSON.

## 4. Aturan UI (WAJIB)

- **JANGAN PAKAI GRADIENT** dalam bentuk apa pun (background/card/button).
- Tidak ada neon, tidak ada glassmorphism berlebihan, tidak ada efek
  "startup"/gaming yang dekoratif.
- Warna solid saja: putih, slate/abu-abu, navy/dark blue, + warna status
  (success/warning/destructive) seperlunya. Lihat token di `src/index.css`.
- Formal, bersih, minimalis, administratif — cocok untuk instansi
  pemerintah. Border tipis, shadow ringan, radius sedang.

## 5. Aturan Data & Keamanan (WAJIB)

- **Jangan pernah** memasukkan data pegawai asli (nama asli, NIP asli,
  NIK, alamat, no. HP, email pribadi, data rekening) ke source code atau
  Git. Gunakan mock data dengan pola `Pegawai Contoh 00X`.
- Jangan menebak arti bisnis kolom cuti (N-2/N-1/N) sebelum dikonfirmasi.
  Status saat ini: **BELUM DIKONFIRMASI** — lihat `docs/data-mapping.md`.
- Jangan hardcode credential/password di frontend.
- Jangan expose seluruh kolom spreadsheet ke API — data minimization,
  hanya field yang benar-benar dipakai dashboard.
- File Excel asli tidak boleh masuk Git (lihat `.gitignore`).

## 6. Struktur Folder

```
src/
├── components/
│   ├── layout/      (AppShell, Header, Sidebar, ProtectedRoute)
│   ├── dashboard/   (StatCard, chart wrappers, dll — Checkpoint 3)
│   ├── employee/    (tabel & filter pegawai — Checkpoint 3)
│   ├── leave/       (tabel & filter cuti — Checkpoint 3)
│   └── ui/          (Button, Input, Label — shadcn-style primitives)
├── pages/           (Login, Dashboard, Employees, EmployeeDetail, Leave)
├── services/api.ts  (SATU-SATUNYA tempat pemanggilan data — jangan fetch
│                      langsung di component)
├── hooks/useAuth.ts (login/logout/session — bukan React Context, lihat
│                      docs/authentication.md § Catatan Implementasi)
├── types/           (Employee, LeaveRecord — masih DRAFT, lihat data-mapping.md)
├── mock/            (data dummy DUK + authUsers.ts untuk demo login)
└── lib/utils.ts     (helper cn() untuk styling)
```

## 7. Status Fitur

### Selesai (Checkpoint 1)
- Setup React + Vite + TypeScript + Tailwind + struktur folder
- Routing dasar (`/login`, `/dashboard`, `/pegawai`, `/pegawai/:nip`, `/cuti`)
  dengan `ProtectedRoute` (redirect ke `/login` jika belum login)
- Design tokens solid (tanpa gradient) di `src/index.css` +
  `tailwind.config.ts`
- Service layer `src/services/api.ts` (masih mengembalikan mock data)
- Draft types `Employee` & `LeaveRecord` (field cuti hasil olahan BELUM
  dibuat — menunggu konfirmasi)

### Selesai (Checkpoint 2)
- UI Login penuh: logo/identitas, form Username/NIP + Password,
  show/hide password, validasi field wajib, pesan error (salah
  credential maupun validasi kosong), loading state saat submit
  (`src/pages/Login.tsx`)
- Mock authentication: `src/mock/authUsers.ts` (akun demo, bukan data
  sensitif) + `useAuth.login()` yang memvalidasi terhadap mock users
  dan menyimpan session di `sessionStorage` (`src/hooks/useAuth.ts`)
- Session bertahan saat refresh (selama tab masih terbuka); hilang saat
  logout atau tab ditutup
- `ProtectedRoute` diperbarui: menyimpan lokasi asal (`state.from`) agar
  user diarahkan kembali ke halaman yang dituju setelah login berhasil
- App layout untuk halaman protected: `AppShell` (`Header` + `Sidebar`
  responsive, mobile nav via overlay) dengan navigasi Dashboard/Pegawai/
  Cuti dan tombol Logout yang benar-benar menghapus session lalu
  redirect ke `/login`
- Komponen UI dasar reusable & accessible: `Button`, `Input`, `Label`
  di `src/components/ui/` (shadcn-style, warna solid, tanpa gradient)
  — dipakai oleh Login dan siap dipakai ulang di Checkpoint 3

### Belum Selesai
- Konten halaman Dashboard (stat cards, grafik), tabel Pegawai
  (search/filter/pagination), halaman Cuti, Detail Pegawai — masih
  placeholder, dikerjakan di **Checkpoint 3**
- Komponen shadcn/ui tambahan (Card, Table, Select, dsb) — ditambahkan
  sesuai kebutuhan di Checkpoint 3+
- Data mapping DUK final & dokumentasi rumus cuti — **Checkpoint 4**
- Integrasi Google Apps Script (API JSON nyata, login tervalidasi di
  server) — **Checkpoint 5**
- Security/accessibility/performance review, deployment — **Checkpoint 6**

## 8. Hal yang Tidak Boleh Diubah Tanpa Alasan Kuat

1. Arsitektur (tanpa backend server, tanpa database) — lihat § 3.
2. Aturan "no gradient" di UI — lihat § 4.
3. Prinsip read-only untuk pengguna (tidak ada CRUD di frontend).
4. Prinsip "jangan menebak makna data cuti" sebelum konfirmasi.
5. Larangan menyimpan data pegawai asli di source code / Git.

## 9. Keputusan Teknis Penting

- ESLint pakai flat config (`eslint.config.js`), bukan `.eslintrc`.
- Path alias `@/*` → `src/*` (dikonfigurasi di `vite.config.ts` &
  `tsconfig.app.json`).
- Auth (`useAuth`) untuk versi prototype pakai `sessionStorage` sebagai
  penanda status login saja — **bukan** mekanisme keamanan production.
  Detail & keterbatasan: `docs/authentication.md`.
- shadcn/ui **belum** di-generate penuh di Checkpoint 1 karena butuh CLI
  (`npx shadcn@latest init`) yang memerlukan koneksi npm registry saat
  development — jalankan di Checkpoint 2 saat environment punya akses
  network penuh.

## 10. Cara Menjalankan

```bash
npm install
npm run dev        # development server
npm run build       # production build (tsc -b && vite build)
npm run lint
```

Lihat `docs/progress.md` untuk status terkini & langkah berikutnya.

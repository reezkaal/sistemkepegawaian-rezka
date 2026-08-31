# Architecture

## Alur Data

```
Google Spreadsheet (sheet "DUK")
        ↓
Google Apps Script (Web App, doGet → JSON)
        ↓
Vercel Serverless Function (/api/employees, /api/leave)
        ↓  [server-side, URL GAS tidak ter-expose ke browser]
React + Vite (src/services/remoteDataSource.ts → api.ts)
        ↓
Static Hosting (Vercel)
```

Tidak ada database server maupun backend custom (Express/NestJS/dsb).
"Backend" adalah Google Apps Script yang membaca spreadsheet dan
mengembalikan JSON melalui Web App deployment.

Vercel Serverless Function bertindak sebagai server-side proxy:
- Membaca `GOOGLE_APPS_SCRIPT_URL` dari environment variable server-side
  (Vercel dashboard) — variabel ini tidak pernah dikirim ke browser.
- Meneruskan request ke GAS dan memproxy response JSON ke frontend.
- Menangani error HTTP, timeout, dan JSON tidak valid.

## Mengapa Arsitektur Ini

- Data sumber sudah berupa spreadsheet yang dikelola petugas — tidak
  perlu database terpisah untuk versi pertama.
- Google Apps Script cukup untuk kebutuhan read-only + data minimization
  (hanya mengirim field yang diperlukan dashboard).
- Vercel Serverless Function menyembunyikan URL GAS dari browser bundle,
  mengurangi direct exposure frontend ke GAS.
- Frontend statis (Vite build) di-host di Vercel tanpa server yang perlu
  dikelola terpisah.

## Batasan yang Disadari

- GAS Web App masih di-deploy dengan akses "Anyone" — URL GAS masih
  bisa diakses siapapun yang mengetahuinya. Proxy ini mengurangi
  keterpaparan langsung dari frontend, bukan isolasi penuh.
- Tidak ada layer autentikasi/otorisasi production di versi ini —
  mekanisme login belum ditentukan stakeholder. Lihat `docs/authentication.md`.
- Skalabilitas Google Apps Script terbatas (quota Google), memadai untuk
  ukuran organisasi internal PPSDMPU tapi bukan untuk trafik besar.
- Refresh data bergantung pada Apps Script membaca ulang spreadsheet
  setiap request (tidak ada caching; bisa ditambahkan belakangan jika
  diperlukan).

## Alur Refresh Data

```
Spreadsheet berubah → Apps Script (membaca ulang saat dipanggil)
        → Vercel Function (/api/employees, /api/leave)
        → React mengambil data terbaru (tombol "Refresh Data"
          atau saat halaman dimuat) → Dashboard/tabel diperbarui
```

Tidak ada deployment ulang frontend yang diperlukan saat data spreadsheet
berubah.

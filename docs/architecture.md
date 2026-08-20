# Architecture

## Alur Data

```
Google Spreadsheet (sheet "DUK")
        ↓
Google Apps Script (Web App, doGet → JSON)
        ↓
JSON API
        ↓
React + Vite (src/services/api.ts)
        ↓
Static Hosting (Vercel / Cloudflare Pages)
```

Tidak ada database server maupun backend custom (Express/NestJS/dsb).
"Backend" adalah Google Apps Script yang membaca spreadsheet dan
mengembalikan JSON melalui Web App deployment.

## Mengapa Arsitektur Ini

- Data sumber sudah berupa spreadsheet yang dikelola petugas — tidak
  perlu database terpisah untuk versi pertama.
- Google Apps Script cukup untuk kebutuhan read-only + data minimization
  (hanya mengirim field yang diperlukan dashboard).
- Frontend statis (Vite build) bisa di-host di Vercel/Cloudflare Pages
  tanpa server yang perlu dikelola.

## Batasan yang Disadari

- Tidak ada layer autentikasi/otorisasi yang kuat di sisi Apps Script
  pada versi prototype — lihat `docs/authentication.md`.
- Skalabilitas Google Apps Script terbatas (quota Google), memadai untuk
  ukuran organisasi internal PPSDMPU tapi bukan untuk trafik besar.
- Refresh data bergantung pada Apps Script membaca ulang spreadsheet
  setiap request (tidak ada caching di Checkpoint 1–5; bisa ditambahkan
  belakangan jika diperlukan).

## Alur Refresh Data

```
Spreadsheet berubah → Apps Script (membaca ulang saat dipanggil)
        → API → React mengambil data terbaru (tombol "Refresh Data"
          atau saat halaman dimuat) → Dashboard/tabel diperbarui
```

Tidak ada deployment ulang frontend yang diperlukan saat data spreadsheet
berubah.

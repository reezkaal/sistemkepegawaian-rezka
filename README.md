# SIMPEG PPSDMPU

Dashboard internal **read-only** untuk informasi kepegawaian & cuti
PPSDMPU, berdasarkan data DUK (Daftar Urut Kepangkatan) yang dikelola di
Google Spreadsheet.

> Untuk konteks lengkap project (aturan, keputusan teknis, status fitur),
> baca [`CLAUDE.md`](./CLAUDE.md) terlebih dahulu.

## Fitur

- Dashboard statistik kepegawaian & cuti
- Daftar pegawai dengan pencarian, filter, dan pagination
- Informasi cuti per tahun
- Detail pegawai
- Login sebagai pembatas akses (bukan sistem multi-role)

Website ini **tidak** menyediakan fitur tambah/edit/hapus data. Semua
pengelolaan data tetap dilakukan lewat spreadsheet oleh petugas.

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui · React Router ·
Recharts · Google Apps Script (API)

## Menjalankan Secara Lokal

```bash
npm install
cp .env.example .env   # isi VITE_API_URL setelah Apps Script tersedia
npm run dev
```

## Build

```bash
npm run build
```

## Struktur Project

Lihat `CLAUDE.md § 6` untuk penjelasan struktur folder.

## Dokumentasi

- [`docs/architecture.md`](./docs/architecture.md) — arsitektur sistem
- [`docs/data-mapping.md`](./docs/data-mapping.md) — mapping kolom DUK ke aplikasi
- [`docs/authentication.md`](./docs/authentication.md) — pendekatan & keterbatasan login
- [`docs/deployment.md`](./docs/deployment.md) — panduan deployment
- [`docs/progress.md`](./docs/progress.md) — status project terkini

## Status

Project ini dikerjakan bertahap dengan checkpoint. Status saat ini:
**Checkpoint 1 (Foundation) selesai.** Lihat `docs/progress.md`.

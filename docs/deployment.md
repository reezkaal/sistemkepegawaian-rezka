# Deployment

## Hosting

Frontend (hasil `npm run build`, folder `dist/`) di-deploy ke **Vercel**.
Vercel juga menjalankan Serverless Functions di folder `api/` sebagai proxy
ke Google Apps Script.

## Environment Variables

### Server-Side (Vercel Dashboard)

Set di **Vercel Project Settings → Environment Variables** — BUKAN di-commit ke Git.

| Variable | Keterangan |
|----------|-----------|
| `GOOGLE_APPS_SCRIPT_URL` | URL Web App Google Apps Script (lihat `docs/google-apps-script.md`). Tanpa prefix `VITE_` agar tidak bocor ke browser. |

### Frontend (Build-time, aman di-commit ke .env.example)

| Variable | Nilai | Keterangan |
|----------|-------|-----------|
| `VITE_DATA_SOURCE` | `mock` atau `remote` | Pilih sumber data. Set ke `remote` di production. |

## Cara Deploy ke Vercel

1. Push repository ke GitHub (pastikan `.env` tidak ter-commit).
2. Buka [vercel.com](https://vercel.com) → Import Git Repository.
3. Vercel otomatis mendeteksi Vite — output directory: `dist`.
4. Di **Project Settings → Environment Variables**, tambahkan:
   - `GOOGLE_APPS_SCRIPT_URL` = URL GAS Anda (mode: Production, Preview, Development)
   - `VITE_DATA_SOURCE` = `remote` (mode: Production, Preview)
5. Deploy. Serverless functions di `api/` otomatis tersedia di `/api/employees` dan `/api/leave`.

## Development Lokal

### Mode Mock (default, tanpa internet)

```bash
cp .env.example .env   # VITE_DATA_SOURCE=mock sudah cukup
npm run dev
```

### Mode Remote (data nyata, via Vite proxy)

```bash
# 1. Isi .env:
#    GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXXX/exec
#    VITE_DATA_SOURCE=remote
npm run dev
# Vite proxy meneruskan /api/* ke GAS secara otomatis
```

### Mode Remote (full Vercel serverless, via vercel dev)

```bash
npm install -g vercel
vercel login
# Isi GOOGLE_APPS_SCRIPT_URL dan VITE_DATA_SOURCE=remote di .env
vercel dev   # port 3000, jalankan /api/* sebagai serverless function lokal
```

## Checklist Sebelum Deploy

- [ ] `npm run lint` sukses tanpa error
- [ ] `npm run build` sukses tanpa error
- [ ] `GOOGLE_APPS_SCRIPT_URL` sudah diisi di Vercel dashboard (server-side, bukan VITE_)
- [ ] `VITE_DATA_SOURCE=remote` di Vercel untuk Production/Preview
- [ ] Tidak ada secret ter-hardcode di source code
- [ ] `grep -r "script.google.com" src/` → kosong
- [ ] `grep -r "VITE_API_URL" src/` → kosong
- [ ] HTTPS aktif (default di Vercel)
- [ ] Google Apps Script Web App sudah di-deploy & URL sudah benar

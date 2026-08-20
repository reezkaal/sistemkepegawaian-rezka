# Deployment

Status: **draft awal** — akan dilengkapi di Checkpoint 6 setelah
integrasi Google Apps Script (Checkpoint 5) selesai.

## Rencana Hosting

Frontend (hasil `npm run build`, folder `dist/`) akan di-deploy sebagai
static site ke salah satu:

- **Vercel**, atau
- **Cloudflare Pages**

Keduanya cocok karena aplikasi ini murni static React (tanpa backend
custom yang perlu di-host terpisah — backend adalah Google Apps Script
Web App yang sudah ter-hosting oleh Google).

## Environment Variable

- `VITE_API_URL` — URL Web App Google Apps Script (lihat `.env.example`).
  Diset di dashboard hosting (Vercel/Cloudflare Pages project settings),
  **bukan** di-commit ke Git.

## Checklist Sebelum Deploy (akan dilengkapi di Checkpoint 6)

- [ ] `npm run build` sukses tanpa error
- [ ] Tidak ada data pegawai asli di repository
- [ ] Tidak ada credential/API key ter-hardcode
- [ ] HTTPS aktif (default di Vercel/Cloudflare Pages)
- [ ] Google Apps Script Web App sudah di-deploy & URL sudah benar
- [ ] Review keamanan & aksesibilitas selesai

# Google Apps Script Web App — Panduan Deploy & Integrasi

**File Apps Script:** `google-apps-script/Code.gs`

Dokumen ini menjelaskan cara men-deploy Apps Script sebagai Web App, konfigurasi `.env`,
dan cara mengaktifkan/menonaktifkan mode data remote.

---

## 1. Prasyarat

- Akun Google yang memiliki akses **Edit** ke spreadsheet PPSDMPU.
- Spreadsheet ID: `1DXWwv9m_A-PNCKQDdXnqNNCosBwa00EpdxXUD6U9UJM`

---

## 2. Cara Deploy Apps Script

### Langkah 1 — Buka Apps Script

1. Buka Google Spreadsheet:
   `https://docs.google.com/spreadsheets/d/1DXWwv9m_A-PNCKQDdXnqNNCosBwa00EpdxXUD6U9UJM/`
2. Klik menu **Extensions → Apps Script**.
   Browser akan membuka editor Apps Script di tab baru.

### Langkah 2 — Paste Kode

1. Di editor Apps Script, hapus kode default yang ada (`function myFunction() {...}`).
2. Salin seluruh isi file `google-apps-script/Code.gs` dari project ini.
3. Paste ke editor Apps Script.
4. Klik ikon **Save** (Ctrl+S) atau tombol simpan.
5. Beri nama project, misalnya: `HRIS PPSDMPU API`.

### Langkah 3 — Deploy sebagai Web App

1. Klik tombol **Deploy** (pojok kanan atas) → **New deployment**.
2. Klik ikon ⚙️ di sebelah "Select type" → pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: `HRIS PPSDMPU API v1` (bebas)
   - **Execute as**: `Me` (akun Google yang punya akses spreadsheet)
   - **Who has access**: `Anyone`
     _(Catatan: ini membuat endpoint bisa diakses publik. Lihat § 6 tentang keamanan.)_
4. Klik **Deploy**.
5. Klik **Authorize access** → ikuti flow izin Google OAuth.
6. Setelah berhasil, salin URL yang muncul.
   Format URL: `https://script.google.com/macros/s/AKfycb.../exec`

> **Simpan URL ini** — diperlukan untuk konfigurasi `.env` di langkah berikutnya.

### Langkah 4 — Update Deployment (jika kode diubah)

Setiap kali kode `Code.gs` diperbarui, deploy ulang:
1. Klik **Deploy → Manage deployments**.
2. Klik ikon pensil (edit) di deployment aktif.
3. Ubah **Version** ke **New version**.
4. Klik **Deploy**.

---

## 3. Konfigurasi `.env`

Salin `.env.example` menjadi `.env` di root project:

```bash
cp .env.example .env
```

Edit file `.env`:

```env
# Isi dengan URL yang didapat dari langkah deploy di atas
VITE_API_URL=https://script.google.com/macros/s/AKfycb.../exec

# Aktifkan data remote:
VITE_DATA_SOURCE=remote
```

Setelah mengubah `.env`, restart dev server:
```bash
npm run dev
```

---

## 4. Cara Mengaktifkan Mode Remote (data asli)

```env
# .env
VITE_API_URL=https://script.google.com/macros/s/AKfycb.../exec
VITE_DATA_SOURCE=remote
```

- Dashboard, halaman Pegawai, dan halaman Cuti akan membaca data asli dari spreadsheet.
- Tidak ada perubahan kode frontend yang diperlukan.

---

## 5. Cara Kembali ke Mode Mock (data contoh)

```env
# .env
VITE_DATA_SOURCE=mock
# VITE_API_URL bisa dibiarkan atau dihapus — tidak dipakai di mode mock
```

Atau cukup hapus/tidak mengisi `VITE_DATA_SOURCE` — default ke `mock`.

---

## 6. Endpoint API

Base URL: `https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec`

| Endpoint | Method | Deskripsi |
|---|---|---|
| `?resource=employees` | GET | Data pegawai dari sheet DUK |
| `?resource=leave` | GET | Nilai cuti tahunan (N-2/N-1/N) per pegawai per tahun |

### Contoh Request

```
GET https://script.google.com/macros/s/.../exec?resource=employees
GET https://script.google.com/macros/s/.../exec?resource=leave
```

### Contoh Response `?resource=employees`

```json
[
  {
    "nama": "ACHMAD ALI MUNIF",
    "nip": "19890518 201012 1 003",
    "tmtGolongan": "2023-04-01",
    "golongan": "III/b",
    "pendidikanPengangkatan": "D-III",
    "tmtPengangkatan": "2010-12-01",
    "tmtJabatan": "2024-07-01",
    "jabatan": "Penelaah Teknis Kebijakan",
    "kelasJabatan": "7",
    "eselon": null,
    "status": "PNS",
    "satker": "PPSDMPU",
    "bidangBagian": "PENDIDIKAN",
    "subBagian": "PD PROGRAM",
    "nomorAbsensi": "68",
    "jenisKelamin": "L",
    "tempatLahir": null,
    "tanggalLahir": "1989-05-18",
    "agama": "Islam",
    "gelarDepan": null,
    "gelarBelakang": "A.Md",
    "tingkatPendidikan": "D-III",
    "tahunLulus": null,
    "institusiPendidikan": "POLITEKNIK PENERBANGAN INDONESIA CURUG",
    "jurusan": "D-III OPERASI BANDAR UDARA",
    "alamat": "GARUDA 40 Tegal Jawa Tengah",
    "emailPribadi": null,
    "emailDinas": "achmad_ali1805@kemenhub.go.id",
    "idBkn": "A8ACA79ABA293912E040640A040269BB",
    "kerpeg": "47389",
    "nik": "3376011805890002",
    "noHp": "085254489318",
    "namaRekening": null,
    "noRekening": "1760003308481",
    "bank": null,
    "npwp": "684570914501000"
  }
]
```

### Contoh Response `?resource=leave`

```json
[
  {
    "nip": "19890518 201012 1 003",
    "nama": "ACHMAD ALI MUNIF",
    "unitKerja": "PENDIDIKAN",
    "tahun": 2024,
    "nMinus2": 0,
    "nMinus1": 4,
    "n": 12
  },
  {
    "nip": "19890518 201012 1 003",
    "nama": "ACHMAD ALI MUNIF",
    "unitKerja": "PENDIDIKAN",
    "tahun": 2025,
    "nMinus2": 0,
    "nMinus1": 4,
    "n": 12
  },
  {
    "nip": "19890518 201012 1 003",
    "nama": "ACHMAD ALI MUNIF",
    "unitKerja": "PENDIDIKAN",
    "tahun": 2026,
    "nMinus2": 0,
    "nMinus1": 6,
    "n": 12
  }
]
```

---

## 7. Keamanan & Data Minimization

### Field yang dikembalikan
Apps Script **hanya** mengembalikan field yang dibutuhkan oleh `type Employee` dan
`LeaveRecord` di aplikasi. Kolom-kolom internal spreadsheet (rumus bantu, catatan,
nomor baris, dll.) tidak dikirim.

### Model keamanan
- Endpoint menggunakan URL unik yang tidak mudah ditebak (deployment ID acak dari Google).
- Tidak ada autentikasi kuat di fase ini — endpoint bisa diakses siapapun yang punya URL.
- Untuk membatasi akses, ubah **Who has access** menjadi **Anyone within [domain G Suite]**
  saat deploy. Ini memerlukan akun Google instansi untuk mengakses API.
- Kontrol akses yang lebih kuat (validasi token) direncanakan di checkpoint berikutnya
  (lihat `docs/authentication.md`).

### Data sensitif di response
Field NIK, NPWP, noRekening, noHp dikembalikan oleh API karena merupakan bagian dari
`type Employee` yang ditampilkan di halaman Detail Pegawai (dengan masking di UI).
Jika dibutuhkan keamanan lebih ketat, field-field ini bisa di-mask di sisi Apps Script
(lihat `docs/spreadsheet-integration.md` § 6).

---

## 8. Troubleshooting

| Problem | Kemungkinan Penyebab | Solusi |
|---|---|---|
| `{"error":true,"message":"..."}` | Parameter resource salah / sheet tidak ditemukan | Cek URL endpoint, pastikan sheet bernama "DUK" |
| Data tidak muncul di dashboard | `VITE_API_URL` belum diisi / salah | Cek `.env`, pastikan URL sudah di-paste dengan benar |
| Error 401/403 | Izin belum diberikan saat deploy | Deploy ulang → authorize akses |
| Data lama (tidak update) | Cache Apps Script | Deploy ulang dengan version baru |
| CORS error di browser | Tidak ada — Apps Script tidak mengirim CORS header untuk doGet JSON | Gunakan `fetch` biasa tanpa header CORS khusus |

---

## 9. Struktur File Apps Script

```
google-apps-script/
└── Code.gs          ← Satu-satunya file yang perlu di-paste ke Apps Script editor
```

Tidak ada `package.json` atau dependency eksternal — Apps Script berjalan di runtime
Google dan tidak membutuhkan npm.

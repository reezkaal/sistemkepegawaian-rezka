# Interactive Gantt Chart Application (Personal Edition)

Aplikasi Gantt Chart interaktif mandiri yang tersimpan di dalam folder `docs/gantt/` tanpa mengubah kode atau konfigurasi Sistem Kepegawaian (HRIS).

---

## 🚀 Cara Menjalankan

Aplikasi bersifat **100% standalone** (murni HTML5, CSS3, dan Vanilla JavaScript) tanpa dependensi eksternal atau build step.

### Cara 1: Buka Langsung di Peramban (Paling Mudah)
Cukup buka berkas HTML berikut langsung dengan peramban web (Chrome, Edge, Firefox):
```text
docs/gantt/index.html
```

### Cara 2: Menjalankan via Local Static Server (Opsional)
```bash
# Menggunakan npx serve
npx serve docs/gantt

# Atau menggunakan Python 3
python -m http.server 8080 --directory docs/gantt
```
Buka peramban di `http://localhost:8080`.

---

## 📂 Struktur File

Semua berkas berada di dalam direktori `docs/gantt/`:

```text
docs/
└── gantt/
    ├── index.html   # Markup semantik, split-table, progress ringkasan, modal CRUD & Detail
    ├── styles.css   # Desain Minimalist Modern Enterprise, warna netral aksen teal/biru
    ├── app.js       # Core logic: Skala Mingguan, Detail Modal, kalkulasi presisi, localStorage
    └── README.md    # Dokumentasi aplikasi
```

---

## 📋 Fitur Utama

1. **Skala Waktu Mingguan Eksklusif:**
   - Kolom timeline mewakili 1 minggu kalender (Senin s/d Minggu) dengan label rentang tanggal yang jelas (misal `26 Okt – 1 Nov`).
   - Penempatan bar task tetap presisi sesuai tanggal mulai dan tanggal selesai sebenarnya.
   - Navigasi minggu sebelumnya (`<`) dan minggu berikutnya (`>`).
   - Tombol **"Hari Ini"** otomatis menggulir timeline tepat ke posisi tanggal dan minggu saat ini.
   - Garis penanda tanggal hari ini tampil presisi di dalam kolom minggu.

2. **Didesain untuk Proyek Pribadi (Tanpa PIC):**
   - Menghapus kolom, form, filter, dan metadata PIC sehingga tabel task lebih luas dan nama task tidak terpotong.
   - Dilengkapi atribut **Prioritas** (Tinggi, Sedang, Rendah) dan **Catatan**.

3. **Detail Task Interaktif (Klik Bar / Baris):**
   - Mengklik bar timeline atau baris task akan membuka modal detail task tanpa mengubah data:
     - Nama task lengkap
     - Status & Prioritas (dengan badge warna)
     - Jadwal tanggal mulai & selesai beserta durasi hari
     - Progress bar visual & persentase
     - Prasyarat (Dependensi)
     - Catatan / detail keterangan pelaksanaan
   - Tombol "Edit Task" untuk beralih ke form pengeditan jika diperlukan.

4. **Ringkasan Progres Proyek Keseluruhan:**
   - Progress bar horizontal besar di bagian atas dashboard dengan persentase rata-rata penyelesaian seluruh task.
   - Kartu statistik status: Total Task, Sedang Berjalan, Selesai, Belum Dimulai, dan Tertunda.

5. **Penyimpanan Otomatis (localStorage) & Toast:**
   - Data tersimpan otomatis di peramban saat penambahan, pengeditan, atau penghapusan task.
   - Notifikasi kecil non-intrusif muncul saat perubahan berhasil disimpan.
   - Fitur **Ekspor JSON**, **Impor JSON** (dengan konfirmasi keamanan), dan **Reset Data**.

6. **Garis Dependensi SVG:**
   - Panah konektor visual yang menghubungkan task prasyarat dengan task penerusnya.

# Authentication — Pendekatan & Keterbatasan

## Tujuan

Login pada aplikasi ini **bukan** sistem manajemen user multi-role.
Tujuannya hanya sebagai **pembatas akses dasar** agar orang yang tidak
berkepentingan tidak dengan mudah membuka dashboard kepegawaian.

## Pendekatan (Prototype)

- Tidak ada credential production yang di-hardcode di source code frontend.
- Status login disimpan di `sessionStorage` browser (`useAuth` hook),
  bukan token/JWT yang diverifikasi server.
- `ProtectedRoute` di React Router mengarahkan pengguna yang belum
  login ke `/login` saat mencoba akses `/dashboard`, `/pegawai`, `/cuti`.
- Refresh halaman tidak menghapus status login selama tab browser masih
  terbuka (session dibaca ulang dari `sessionStorage` saat komponen mount).

## Mock Credentials (Checkpoint 2)

Validasi username/password saat ini memakai `src/mock/authUsers.ts` —
daftar akun **demo, bukan data sensitif nyata**, didokumentasikan secara
eksplisit di dalam file tersebut sebagai non-production. Dua akun contoh
disediakan untuk testing:

- `admin` / `admin123`
- NIP dummy `198001012005011001` / `password123` (mengikuti mock
  pegawai di `src/mock/employees.ts`)

Fungsi `login()` di `useAuth` memanggil `validateMockCredentials()` dari
file tersebut. **Saat Checkpoint 5 (integrasi Google Apps Script)**,
`login()` harus diganti untuk memanggil endpoint verifikasi sungguhan;
`src/mock/authUsers.ts` boleh dihapus/diabaikan setelah itu.

## Catatan Implementasi: Logout & Reaktivitas

`useAuth` bukan React Context — setiap komponen yang memanggilnya
memiliki state lokalnya sendiri (dibaca dari `sessionStorage` saat
mount). Konsekuensinya: setelah `logout()` dipanggil dari `Sidebar`,
kode secara eksplisit memanggil `navigate('/login', { replace: true })`
supaya route berpindah dan `ProtectedRoute` di halaman baru membaca
ulang `sessionStorage` (yang sudah kosong) dari awal — bukan mengandalkan
re-render otomatis lintas komponen.

Jika di checkpoint berikutnya kebutuhan auth makin kompleks (mis. perlu
diakses dari banyak komponen sekaligus secara reaktif), pertimbangkan
migrasi `useAuth` menjadi React Context. Ini didokumentasikan di sini
sebagai keputusan teknis yang disengaja untuk versi prototype, bukan
oversight.

## Keterbatasan yang Perlu Disadari

1. **Ini bukan keamanan production-grade.** Karena aplikasi adalah
   static site (tanpa backend custom), verifikasi login sesungguhnya
   perlu dilakukan di sisi Google Apps Script (Web App) — misalnya
   dengan memvalidasi token/API key sederhana sebelum mengembalikan
   data.
2. Seseorang yang cukup teknis berpotensi mem-bypass pengecekan di sisi
   client jika API di baliknya tidak ikut memvalidasi akses. **API
   Apps Script harus tetap membatasi siapa yang bisa memanggilnya**
   (mis. dengan API key/token yang dikirim di header, bukan hardcode di
   repo publik).
3. `sessionStorage` hilang saat tab ditutup — ini disengaja untuk
   prototype (bukan bug), agar sesi tidak bertahan tanpa batas waktu.
4. Rencana peningkatan (di luar Checkpoint 1–6 versi awal): opsi
   autentikasi berbasis Google Workspace SSO (login dengan akun
   instansi) bisa dipertimbangkan untuk versi berikutnya agar lebih
   kuat dibanding username/password statis.

## Yang Tidak Boleh Dilakukan

- Menyimpan username/password production di source code frontend.
- Meng-commit file `.env` berisi credential ke Git.
- Mengandalkan hanya `ProtectedRoute` di frontend sebagai satu-satunya
  lapisan keamanan tanpa validasi di sisi API.

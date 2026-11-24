# Panduan Setup Supabase Auth & Role (SIMPEG PPSDMPU)

Dokumen ini berisi panduan konfigurasi Supabase untuk sistem autentikasi dan manajemen role (`superadmin`, `admin`, `user`).

---

## 1. Buat Proyek di Supabase

1. Buka [supabase.com](https://supabase.com) dan buat proyek baru (misal: `ppsdmpu-simpeg`).
2. Masuk ke menu **Project Settings** → **API**.
3. Salin:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **anon / public key** (kunci publik panjang)
4. Masukkan kedua nilai tersebut ke file `.env` di proyek ini:
   ```env
   VITE_SUPABASE_URL=https://xyzcompany.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJh...
   ```

---

## 2. Eksekusi Script SQL (Tabel Profiles & Role)

Buka menu **SQL Editor** di dashboard Supabase Anda, lalu buat query baru dan jalankan script berikut:

```sql
-- 1. Buat ENUM Role
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('superadmin', 'admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Buat Tabel Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  nip TEXT UNIQUE,
  nama TEXT NOT NULL,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Aktifkan Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Berikan Hak Akses Tabel ke Authenticated User & Service Role
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON TABLE public.profiles TO authenticated, service_role;

-- 5. Kebijakan RLS (Security Policies)
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
CREATE POLICY "Allow authenticated read profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow user update own profile" ON public.profiles;
CREATE POLICY "Allow user update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- 5. Trigger Otomatis saat Akun Dibuat di Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nip, nama, role)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'nip',
    COALESCE(new.raw_user_meta_data->>'nama', new.raw_user_meta_data->>'displayName', split_part(new.email, '@', 1)),
    COALESCE((new.raw_user_meta_data->>'role')::public.app_role, 'user'::public.app_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    nip = EXCLUDED.nip,
    nama = EXCLUDED.nama,
    role = EXCLUDED.role;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## 3. Membuat Akun Awal (Demo / Production)

Anda dapat membuat akun langsung lewat menu **Authentication** → **Users** → **Add User** (Create User):

### Contoh Akun Superadmin:
- **Email**: `superadmin@ppsdmpu.go.id`
- **Password**: `AdminPPSDMPU2026!`
- **User Metadata** (JSON):
  ```json
  {
    "nama": "Super Administrator",
    "nip": "197501012000031001",
    "role": "superadmin"
  }
  ```

### Contoh Akun Admin Kepegawaian:
- **Email**: `admin@ppsdmpu.go.id`
- **Password**: `Admin123!`
- **User Metadata** (JSON):
  ```json
  {
    "nama": "Admin Kepegawaian",
    "nip": "198501012010011002",
    "role": "admin"
  }
  ```

### Contoh Akun Pegawai (User Biasa):
- **Email**: `198001012005011001@ppsdmpu.internal` (atau email pegawai asli)
- **Password**: `Password123!`
- **User Metadata** (JSON):
  ```json
  {
    "nama": "Budi Santoso",
    "nip": "198001012005011001",
    "role": "user"
  }
  ```

---

## 4. Konfigurasi Service Role Key (Fitur Kelola Pengguna / Add User)

Fitur **Kelola Pengguna** (`/kelola-pengguna`) memungkinkan Superadmin dan Admin membuat akun pengguna baru langsung dari dalam aplikasi:

1. Buka dashboard Supabase → **Project Settings** → **API**.
2. Di bagian **Project API keys**, temukan kunci `service_role` (Secret / rahasia).
3. **PENTING**:
   - Untuk **Development lokal**: Masukkan ke file `.env`:
     ```env
     SUPABASE_SERVICE_ROLE_KEY=eyJh...
     ```
   - Untuk **Production (Vercel)**: Masukkan ke Vercel Dashboard → **Project Settings** → **Environment Variables** dengan nama `SUPABASE_SERVICE_ROLE_KEY`.
   - **JANGAN** pernah menambahkan prefix `VITE_` pada key ini karena service role key membypass seluruh RLS.



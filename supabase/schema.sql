-- ============================================================================
-- SIMPEG PPSDMPU: Setup Tabel Profiles & Role
-- Salin seluruh isi file ini dan jalankan di SQL Editor Supabase
-- ============================================================================

-- 1. Buat ENUM Role (superadmin, admin, user)
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

-- 4. Berikan Hak Akses Tabel (Permissions) ke Authenticated User & Service Role
-- Hanya beri hak SELECT ke authenticated (tidak boleh INSERT/UPDATE/DELETE langsung dari client)
GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON TABLE public.profiles FROM anon, authenticated;
GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT ALL ON TABLE public.profiles TO service_role;

-- Helper function untuk membaca role user saat ini tanpa memicu rekursi RLS
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 5. Kebijakan RLS (Security Policies)
DROP POLICY IF EXISTS "Allow authenticated read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow read own or admin read all profiles" ON public.profiles;
CREATE POLICY "Allow read own or admin read all profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id
    OR public.get_my_role() IN ('superadmin', 'admin')
  );

-- Hapus policy UPDATE langsung oleh user agar tidak bisa mengubah kolom role sendiri
-- Semua perubahan profil/role dilakukan melalui server-side API (service_role)
DROP POLICY IF EXISTS "Allow user update own profile" ON public.profiles;

-- 6. Trigger Otomatis saat Akun Dibuat di auth.users
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
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


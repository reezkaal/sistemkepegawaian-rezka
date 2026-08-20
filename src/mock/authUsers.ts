/**
 * MOCK / DEMO CREDENTIALS — BUKAN CREDENTIAL PRODUCTION.
 *
 * File ini sengaja berisi akun contoh untuk keperluan prototype
 * Checkpoint 2 saja (lihat docs/authentication.md). Ini BUKAN mekanisme
 * keamanan sesungguhnya dan TIDAK BOLEH dipakai apa adanya di produksi.
 * Saat integrasi backend/Apps Script (Checkpoint 5+), mekanisme ini harus
 * diganti dengan validasi sisi server yang sesungguhnya.
 *
 * Silakan tambah/ubah akun demo ini sesuai kebutuhan testing internal.
 */

export interface MockUser {
  username: string
  password: string
  displayName: string
}

export const MOCK_USERS: MockUser[] = [
  { username: 'admin', password: 'admin123', displayName: 'Admin PPSDMPU (Demo)' },
  { username: '198001012005011001', password: 'password123', displayName: 'Pegawai Contoh 001' },
]

export function validateMockCredentials(
  usernameOrNip: string,
  password: string,
): MockUser | null {
  const user = MOCK_USERS.find(
    (u) => u.username.toLowerCase() === usernameOrNip.trim().toLowerCase(),
  )
  if (!user) return null
  if (user.password !== password) return null
  return user
}

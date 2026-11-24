import type { UserRole } from '@/types/auth'

export interface MockUser {
  username: string
  password: string
  displayName: string
  role: UserRole
  nip?: string
}

export const MOCK_USERS: MockUser[] = [
  {
    username: 'superadmin',
    password: 'admin123',
    displayName: 'Super Administrator',
    role: 'superadmin',
    nip: '197501012000031001',
  },
  {
    username: 'admin',
    password: 'admin123',
    displayName: 'Admin PPSDMPU (Demo)',
    role: 'admin',
    nip: '198501012010011002',
  },
  {
    username: '198001012005011001',
    password: 'password123',
    displayName: 'Pegawai Contoh 001',
    role: 'user',
    nip: '198001012005011001',
  },
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

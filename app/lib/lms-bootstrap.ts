import { initDefaultAdmin } from '@/lib/auth-storage'
import { seedDummyData } from '@/lib/seed-data'

const KEY = '__lms_bootstrapped__'

export function ensureLmsBootstrapped() {
  if (typeof window === 'undefined') return
  const g = globalThis as Record<string, unknown>
  if (g[KEY]) return

  initDefaultAdmin()
  seedDummyData()
  g[KEY] = true
}

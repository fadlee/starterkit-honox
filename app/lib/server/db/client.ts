import { drizzle } from 'drizzle-orm/d1'

import * as schema from '@/lib/server/db/schema'

export function getDb(database: D1Database) {
  return drizzle(database, { schema })
}

export type DrizzleDb = ReturnType<typeof getDb>

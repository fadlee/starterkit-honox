import { execFileSync } from 'node:child_process'

import { hashPassword } from '@/lib/server/db/password'

function usage(): never {
  console.error(
    'Usage: bun run reset-admin-password -- --username <username> --password <newPassword> [--remote]\n' +
      'Example local : bun run reset-admin-password -- --username admin --password "AdminBaru123"\n' +
      'Example remote: bun run reset-admin-password -- --username admin --password "AdminBaru123" --remote'
  )
  process.exit(1)
}

function getArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return undefined
  return process.argv[idx + 1]
}

function escapeSql(value: string): string {
  return value.replace(/'/g, "''")
}

async function main() {
  const username = getArg('--username')
  const newPassword = getArg('--password')
  const isRemote = process.argv.includes('--remote')

  if (!username || !newPassword) usage()
  if (newPassword.length < 6) {
    console.error('Error: password minimal 6 karakter.')
    process.exit(1)
  }

  const normalized = username.trim().toLowerCase()
  const passwordHash = await hashPassword(newPassword)

  const sql = `UPDATE users\nSET password_hash = '${escapeSql(passwordHash)}', updated_at = CURRENT_TIMESTAMP\nWHERE username_normalized = '${escapeSql(normalized)}';`

  const wranglerArgs = ['d1', 'execute', 'LMS_DB', '--command', sql]
  if (isRemote) wranglerArgs.push('--remote')
  else wranglerArgs.push('--local')

  console.log(`Reset password untuk user: ${normalized}`)
  console.log(`Target database: ${isRemote ? 'REMOTE' : 'LOCAL'}`)

  execFileSync('wrangler', wranglerArgs, { stdio: 'inherit' })

  console.log('Selesai. Silakan login ulang dengan password baru.')
}

void main()

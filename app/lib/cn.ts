export type ClassValue = unknown

export function cn(...values: ClassValue[]): string {
  const out: string[] = []
  for (const v of values) {
    if (typeof v !== 'string') continue
    const trimmed = v.trim()
    if (!trimmed) continue
    out.push(trimmed)
  }
  return out.join(' ')
}

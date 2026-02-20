import type { Context } from 'hono'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export function badRequest(message: string): never {
  throw new ApiError(400, message)
}

export function unauthorized(message = 'unauthorized'): never {
  throw new ApiError(401, message)
}

export function forbidden(message = 'forbidden'): never {
  throw new ApiError(403, message)
}

export function notFound(message = 'not found'): never {
  throw new ApiError(404, message)
}

export function conflict(message: string): never {
  throw new ApiError(409, message)
}

export async function readJsonBody<T>(c: Context): Promise<T> {
  try {
    return (await c.req.json()) as T
  } catch {
    throw new ApiError(400, 'invalid json body')
  }
}

export function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new ApiError(400, `${field} is required`)
  }
  const trimmed = value.trim()
  if (!trimmed) {
    throw new ApiError(400, `${field} is required`)
  }
  return trimmed
}

export function requireStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new ApiError(400, `${field} must be an array`)
  }

  const result = value.map((item) => {
    if (typeof item !== 'string') {
      throw new ApiError(400, `${field} must contain strings`)
    }
    return item
  })

  return result
}

export function setNoStore(c: Context): void {
  c.header('cache-control', 'no-store')
}

export function handleApiError(c: Context, error: unknown) {
  if (error instanceof ApiError) {
    return c.json({ error: error.message }, error.status)
  }

  console.error('[api] unexpected error', error)
  return c.json({ error: 'internal server error' }, 500)
}

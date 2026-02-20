export class ApiHttpError extends Error {
  status: number
  payload: unknown

  constructor(status: number, message: string, payload: unknown) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.payload = payload
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers)
  if (init?.body !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }

  const method = (init?.method ?? 'GET').toUpperCase()
  const requestInit: RequestInit = {
    ...init,
    credentials: 'include',
    headers,
  }

  if ((method === 'GET' || method === 'HEAD') && requestInit.cache === undefined) {
    requestInit.cache = 'no-store'
    if (!headers.has('cache-control')) {
      headers.set('cache-control', 'no-store')
    }
  }

  const response = await fetch(path, requestInit)

  let payload: unknown = null
  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    try {
      payload = await response.json()
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload && 'error' in payload
        ? String((payload as { error: unknown }).error)
        : `Request failed with status ${response.status}`
    throw new ApiHttpError(response.status, message, payload)
  }

  return payload as T
}

import { useEffect, useMemo, useState } from 'hono/jsx'

type Route =
  | { kind: 'home' }
  | { kind: 'users' }
  | { kind: 'user'; id: string }
  | { kind: 'not-found'; path: string }

function normalizeHashPath(hash: string): string {
  if (!hash || hash === '#') return '/'

  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return '/'
  return raw.startsWith('/') ? raw : `/${raw}`
}

function parseRoute(hashPath: string): Route {
  if (hashPath === '/' || hashPath === '') return { kind: 'home' }

  const segments = hashPath.replace(/^\//, '').split('/').filter(Boolean)
  if (segments.length === 1 && segments[0] === 'users') return { kind: 'users' }
  if (segments.length === 2 && segments[0] === 'users') {
    const id = decodeURIComponent(segments[1])
    return { kind: 'user', id }
  }
  return { kind: 'not-found', path: hashPath }
}

function buildDeepLink(hashPath: string): string {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  url.hash = hashPath === '/' ? '' : hashPath
  return url.toString()
}

type Props = {
  exampleUserIds?: string[]
}

export default function SpaRouter(props: Props) {
  const exampleUserIds = props.exampleUserIds ?? ['1', '42', '999']

  const [hashPath, setHashPath] = useState('/')
  const [jumpId, setJumpId] = useState('')
  const [copyStatus, setCopyStatus] = useState<string | null>(null)

  useEffect(() => {
    const update = () => setHashPath(normalizeHashPath(window.location.hash))
    update()
    addEventListener('hashchange', update)
    return () => removeEventListener('hashchange', update)
  }, [])

  const route = useMemo(() => parseRoute(hashPath), [hashPath])

  const navigate = (path: string) => {
    const normalized = path.startsWith('/') ? path : `/${path}`
    if (normalized === '/') {
      window.location.hash = ''
      return
    }
    window.location.hash = normalized
  }

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopyStatus('Copied')
    } catch {
      setCopyStatus('Copy failed')
    } finally {
      setTimeout(() => setCopyStatus(null), 1200)
    }
  }

  const examples = useMemo(() => {
    const paths = ['/', '/users', ...exampleUserIds.map((id) => `/users/${encodeURIComponent(id)}`)]
    return paths.map((p) => ({ path: p, url: buildDeepLink(p) }))
  }, [exampleUserIds.join(',')])

  return (
    <div class="border rounded p-4">
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-orange-500 text-white"
          onClick={() => navigate('/')}
        >
          Home
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-orange-500 text-white"
          onClick={() => navigate('/users')}
        >
          Users
        </button>
        <div class="flex items-center gap-2">
          <label class="text-sm opacity-70" for="jump-id">
            Go to user
          </label>
          <input
            id="jump-id"
            class="px-2 py-1 border rounded w-28"
            value={jumpId}
            onInput={(e) => setJumpId((e.target as HTMLInputElement).value)}
            placeholder="123"
          />
          <button
            type="button"
            class="px-3 py-1.5 rounded bg-black text-white"
            onClick={() => {
              const trimmed = jumpId.trim()
              if (!trimmed) return
              navigate(`/users/${encodeURIComponent(trimmed)}`)
            }}
          >
            Go
          </button>
        </div>
        {copyStatus && <span class="text-sm opacity-70">{copyStatus}</span>}
      </div>

      <div class="mt-4 text-sm opacity-70">
        Current route: <span class="font-mono">{hashPath}</span>
      </div>

      <div class="mt-4">
        {route.kind === 'home' && (
          <div class="space-y-3">
            <h2 class="text-lg font-semibold">Hash Router</h2>
            <p class="text-sm opacity-80">
              This demo uses hash-based routing so it doesn&apos;t conflict with Turbo Drive.
            </p>
            <div>
              <p class="text-sm font-semibold">Copyable deep links</p>
              <div class="mt-2 flex flex-col gap-2">
                {examples.map((ex) => (
                  <div key={ex.path} class="flex items-center gap-2">
                    <input
                      class="px-2 py-1 border rounded font-mono text-xs w-full"
                      value={ex.url}
                      readOnly
                    />
                    <button
                      type="button"
                      class="px-3 py-1.5 rounded bg-black text-white"
                      onClick={() => copy(ex.url)}
                      disabled={!ex.url}
                    >
                      Copy
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {route.kind === 'users' && (
          <div class="space-y-3">
            <h2 class="text-lg font-semibold">Users</h2>
            <p class="text-sm opacity-80">Pick a user ID:</p>
            <div class="flex flex-wrap gap-2">
              {exampleUserIds.map((id) => (
                <button
                  key={id}
                  type="button"
                  class="px-3 py-1.5 rounded border"
                  onClick={() => navigate(`/users/${encodeURIComponent(id)}`)}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
        )}

        {route.kind === 'user' && (
          <div class="space-y-3">
            <div class="flex items-center justify-between gap-4">
              <h2 class="text-lg font-semibold">User</h2>
              <button
                type="button"
                class="px-3 py-1.5 rounded border"
                onClick={() => navigate('/users')}
              >
                Back to list
              </button>
            </div>
            <div class="p-3 rounded bg-gray-50 border">
              <p class="text-sm opacity-70">Dynamic segment</p>
              <p class="mt-1 font-mono text-xl">users/{route.id}</p>
              <p class="mt-2 text-sm opacity-80">
                This view is rendered client-side based on the URL hash.
              </p>
            </div>
            <button
              type="button"
              class="px-3 py-1.5 rounded bg-black text-white"
              onClick={() => copy(buildDeepLink(`/users/${encodeURIComponent(route.id)}`))}
            >
              Copy this deep link
            </button>
          </div>
        )}

        {route.kind === 'not-found' && (
          <div class="space-y-3">
            <h2 class="text-lg font-semibold">Not found</h2>
            <p class="text-sm opacity-80">
              No route matches <span class="font-mono">{route.path}</span>
            </p>
            <button
              type="button"
              class="px-3 py-1.5 rounded bg-orange-500 text-white"
              onClick={() => navigate('/')}
            >
              Go home
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

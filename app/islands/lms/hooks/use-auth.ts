import { useCallback, useEffect, useState } from 'hono/jsx'

import { createUser, getCurrentUser, login as authLogin, logout as authLogout } from '@/lib/auth-storage'
import type { User } from '@/types/lms'

type AuthState = {
  user: User | null
  loading: boolean
}

const RETRY_DELAY_MS = 120
const authSubscribers = new Set<(state: AuthState) => void>()

let sharedAuthState: AuthState = {
  user: null,
  loading: true,
}

let bootstrapPromise: Promise<void> | null = null

function publishAuth(nextState: AuthState) {
  sharedAuthState = nextState
  for (const subscriber of authSubscribers) {
    subscriber(sharedAuthState)
  }
}

async function wait(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

async function resolveSessionUser(): Promise<User | null> {
  const firstTry = await getCurrentUser()
  if (firstTry) return firstTry

  // Retry once to avoid race with Set-Cookie propagation right after login.
  await wait(RETRY_DELAY_MS)
  return getCurrentUser()
}

async function bootstrapAuthState(): Promise<void> {
  if (!sharedAuthState.loading) return

  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      const user = await resolveSessionUser()
      publishAuth({ user, loading: false })
    })().finally(() => {
      bootstrapPromise = null
    })
  }

  await bootstrapPromise
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(sharedAuthState)

  useEffect(() => {
    let active = true
    const subscriber = (nextState: AuthState) => {
      if (!active) return
      setAuth(nextState)
    }
    authSubscribers.add(subscriber)
    subscriber(sharedAuthState)

    if (sharedAuthState.loading) {
      void bootstrapAuthState()
    }

    return () => {
      active = false
      authSubscribers.delete(subscriber)
    }
  }, [])

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    const nextUser = await authLogin(username, password)
    publishAuth({ user: nextUser, loading: false })
    return nextUser
  }, [])

  const logout = useCallback(async () => {
    await authLogout()
    publishAuth({ user: null, loading: false })
  }, [])

  const register = useCallback(
    async (data: { username: string; password: string; displayName: string }): Promise<User | null> => {
      const newUser = await createUser(data)
      publishAuth({ user: newUser, loading: false })
      return newUser
    },
    []
  )

  const refresh = useCallback(async () => {
    const user = await resolveSessionUser()
    publishAuth({ user, loading: false })
  }, [])

  return {
    user: auth.user,
    loading: auth.loading,
    isAdmin: auth.user?.role === 'admin',
    login,
    logout,
    register,
    refresh,
  }
}

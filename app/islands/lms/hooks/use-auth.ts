import { useCallback, useEffect, useState } from 'hono/jsx'

import { createUser, getCurrentUser, initDefaultAdmin, login as authLogin, logout as authLogout } from '@/lib/auth-storage'
import { ensureLmsBootstrapped } from '@/lib/lms-bootstrap'
import type { User } from '@/types/lms'

export function useAuth() {
  const [auth, setAuth] = useState<{ user: User | null; loading: boolean }>({
    user: null,
    loading: true,
  })

  useEffect(() => {
    ensureLmsBootstrapped()
    initDefaultAdmin()
    setAuth({
      user: getCurrentUser(),
      loading: false,
    })
  }, [])

  const login = useCallback((username: string, password: string): User | null => {
    const nextUser = authLogin(username, password)
    setAuth({ user: nextUser, loading: false })
    return nextUser
  }, [])

  const logout = useCallback(() => {
    authLogout()
    setAuth({ user: null, loading: false })
  }, [])

  const register = useCallback(
    (data: { username: string; password: string; displayName: string }): User | null => {
      const newUser = createUser(data)
      if (newUser) {
        authLogin(newUser.username, data.password)
        setAuth({ user: newUser, loading: false })
      }
      return newUser
    },
    []
  )

  const refresh = useCallback(() => {
    setAuth({ user: getCurrentUser(), loading: false })
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

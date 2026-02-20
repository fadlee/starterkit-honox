import type { Context } from 'hono'
import { deleteCookie, getCookie, setCookie } from 'hono/cookie'

import type { User } from '@/types/lms'
import { forbidden, unauthorized } from '@/lib/server/api-utils'
import {
  createSession,
  deleteSession,
  getSessionUser as getStoreSessionUser,
} from '@/lib/server/lms-store'

const COOKIE_NAME = 'lms_session'
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60

function isSecureRequest(c: Context) {
  const url = new URL(c.req.url)
  return url.protocol === 'https:'
}

export function setSessionCookie(c: Context, userId: string): string {
  const sessionId = createSession(userId)
  setCookie(c, COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: isSecureRequest(c),
  })
  return sessionId
}

export function clearSessionCookie(c: Context): void {
  const sessionId = getCookie(c, COOKIE_NAME)
  if (sessionId) {
    deleteSession(sessionId)
  }

  deleteCookie(c, COOKIE_NAME, {
    path: '/',
  })
}

export function getSessionUser(c: Context): User | null {
  const sessionId = getCookie(c, COOKIE_NAME)
  return getStoreSessionUser(sessionId)
}

export function requireAuth(c: Context): User {
  const user = getSessionUser(c)
  if (!user) {
    unauthorized('auth required')
  }
  return user
}

export function requireAdmin(c: Context): User {
  const user = requireAuth(c)
  if (user.role !== 'admin') {
    forbidden('admin required')
  }
  return user
}

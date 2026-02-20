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

export async function setSessionCookie(c: Context, userId: string): Promise<string> {
  const sessionId = await createSession(c.env.LMS_DB, userId)
  setCookie(c, COOKIE_NAME, sessionId, {
    path: '/',
    httpOnly: true,
    sameSite: 'Lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    secure: isSecureRequest(c),
  })
  return sessionId
}

export async function clearSessionCookie(c: Context): Promise<void> {
  const sessionId = getCookie(c, COOKIE_NAME)
  if (sessionId) {
    await deleteSession(c.env.LMS_DB, sessionId)
  }

  deleteCookie(c, COOKIE_NAME, {
    path: '/',
  })
}

export async function getSessionUser(c: Context): Promise<User | null> {
  const sessionId = getCookie(c, COOKIE_NAME)
  return getStoreSessionUser(c.env.LMS_DB, sessionId)
}

export async function requireAuth(c: Context): Promise<User> {
  const user = await getSessionUser(c)
  if (!user) {
    unauthorized('auth required')
  }
  return user
}

export async function requireAdmin(c: Context): Promise<User> {
  const user = await requireAuth(c)
  if (user.role !== 'admin') {
    forbidden('admin required')
  }
  return user
}

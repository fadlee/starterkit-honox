import type { Context } from 'hono'

export const SEO_SITE_NAME = 'LMS Course Builder'
export const SEO_DEFAULT_TITLE = SEO_SITE_NAME
export const SEO_DEFAULT_DESCRIPTION =
  'Platform pembelajaran untuk menemukan, mengikuti, dan menyelesaikan kursus secara online.'

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '')
}

export function resolveSiteUrl(c: Context): string {
  const configured = c.env.SITE_URL?.trim()
  if (configured) {
    try {
      return trimTrailingSlash(new URL(configured).toString())
    } catch {
      // Fall back to request origin when SITE_URL is malformed.
    }
  }

  const requestUrl = new URL(c.req.url)
  return `${requestUrl.protocol}//${requestUrl.host}`
}

export function toAbsoluteUrl(c: Context, pathOrUrl: string): string {
  try {
    return new URL(pathOrUrl).toString()
  } catch {
    return new URL(pathOrUrl, `${resolveSiteUrl(c)}/`).toString()
  }
}

export function stripHtmlAndTruncate(input: string, maxLength = 160): string {
  const plain = input
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain
  return `${plain.slice(0, Math.max(0, maxLength - 1)).trim()}…`
}

export function buildRobots(noindex: boolean): string {
  return noindex ? 'noindex,nofollow' : 'index,follow'
}

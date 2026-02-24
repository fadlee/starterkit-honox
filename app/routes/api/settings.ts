import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { handleApiError, readJsonBody, setNoStore } from '@/lib/server/api-utils'
import { getSiteSettings, setSiteSettings } from '@/lib/server/lms-store'

export const GET = createRoute(async (c) => {
  try {
    setNoStore(c)
    const settings = await getSiteSettings(c.env.LMS_DB)
    return c.json(settings, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const PUT = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    const body = await readJsonBody<Record<string, unknown>>(c)
    const data: { siteName?: string; siteIcon?: string } = {}
    if (typeof body.siteName === 'string') data.siteName = body.siteName.trim()
    if (typeof body.siteIcon === 'string') data.siteIcon = body.siteIcon.trim()
    const settings = await setSiteSettings(c.env.LMS_DB, data)
    return c.json(settings, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export default createRoute(async (c) => {
  try {
    setNoStore(c)
    const settings = await getSiteSettings(c.env.LMS_DB)
    return c.json(settings, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

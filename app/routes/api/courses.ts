import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseCourseCreateInput } from '@/lib/server/lms-payloads'
import { createCourse, listCourses } from '@/lib/server/lms-store'
import { handleApiError, readJsonBody, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)
    return c.json(await listCourses(c.env.LMS_DB), 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const POST = createRoute(async (c) => {
  try {
    await requireAdmin(c)
    setNoStore(c)

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const input = parseCourseCreateInput(body)

    const created = await createCourse(c.env.LMS_DB, input)
    return c.json(created, 201)
  } catch (error) {
    return handleApiError(c, error)
  }
})

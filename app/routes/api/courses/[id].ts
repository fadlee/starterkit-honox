import { createRoute } from 'honox/factory'

import { requireAdmin } from '@/lib/server/api-auth'
import { parseCourseUpdateInput } from '@/lib/server/lms-payloads'
import { deleteCourse, getCourseById, updateCourse } from '@/lib/server/lms-store'
import { handleApiError, notFound, readJsonBody, setNoStore } from '@/lib/server/api-utils'

export default createRoute(async (c) => {
  try {
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('course not found')
    }

    const course = getCourseById(id)
    if (!course) {
      notFound('course not found')
    }

    return c.json(course, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const PATCH = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('course not found')
    }

    const body = (await readJsonBody<Record<string, unknown>>(c)) ?? {}
    const data = parseCourseUpdateInput(body)

    const updated = updateCourse(id, data)
    if (!updated) {
      notFound('course not found')
    }

    return c.json(updated, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const DELETE = createRoute(async (c) => {
  try {
    requireAdmin(c)
    setNoStore(c)

    const id = c.req.param('id')
    if (!id) {
      notFound('course not found')
    }

    const deleted = deleteCourse(id)
    if (!deleted) {
      notFound('course not found')
    }

    return c.json({ ok: true }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

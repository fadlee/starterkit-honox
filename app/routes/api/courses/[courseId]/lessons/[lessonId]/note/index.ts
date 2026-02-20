import { createRoute } from 'honox/factory'

import { requireAuth } from '@/lib/server/api-auth'
import { getCourseById, getLessonById, getNote, saveNote } from '@/lib/server/lms-store'
import {
  badRequest,
  handleApiError,
  notFound,
  readJsonBody,
  setNoStore,
} from '@/lib/server/api-utils'

type Body = {
  note?: unknown
}

export default createRoute(async (c) => {
  try {
    const user = requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    const lessonId = c.req.param('lessonId')
    if (!courseId || !lessonId) {
      notFound('lesson not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    const lesson = getLessonById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      notFound('lesson not found')
    }

    return c.json({ note: getNote(user.id, courseId, lessonId) }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

export const PUT = createRoute(async (c) => {
  try {
    const user = requireAuth(c)
    setNoStore(c)

    const courseId = c.req.param('courseId')
    const lessonId = c.req.param('lessonId')
    if (!courseId || !lessonId) {
      notFound('lesson not found')
    }

    const course = getCourseById(courseId)
    if (!course) {
      notFound('course not found')
    }

    const lesson = getLessonById(lessonId)
    if (!lesson || lesson.courseId !== courseId) {
      notFound('lesson not found')
    }

    const body = await readJsonBody<Body>(c)
    if (typeof body.note !== 'string') {
      badRequest('note must be a string')
    }

    const ok = saveNote(user.id, courseId, lessonId, body.note)
    if (!ok) {
      badRequest('please enroll in this course first')
    }

    return c.json({ ok: true, note: body.note }, 200)
  } catch (error) {
    return handleApiError(c, error)
  }
})

import { createRoute } from 'honox/factory'

import CoursePlayerPage from '@/islands/lms/pages/course-player-page'
import { stripHtmlAndTruncate } from '@/lib/seo'
import { getCourseBySlug } from '@/lib/server/lms-store'

export default createRoute(async (c) => {
  const courseslug = c.req.param('courseslug')
  if (!courseslug) {
    return c.redirect('/')
  }

  const course = await getCourseBySlug(c.env.LMS_DB, courseslug)
  if (!course) {
    return c.redirect('/')
  }

  const description =
    stripHtmlAndTruncate(course.description || '', 160) ||
    `Mulai belajar ${course.title} di LMS Course Builder.`

  return c.render(<CoursePlayerPage courseslug={courseslug} />, {
    title: `Belajar ${course.title}`,
    description,
    canonicalPath: `/courses/${courseslug}/lessons`,
    noindex: false,
    ogImage: course.featuredImage || '/favicon.ico',
    ogType: 'article',
  })
})

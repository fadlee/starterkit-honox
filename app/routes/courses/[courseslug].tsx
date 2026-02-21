import { createRoute } from 'honox/factory'

import CourseDetailPage from '@/islands/lms/pages/course-detail-page'
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
    `Pelajari ${course.title} di ${course.author || 'LMS Course Builder'}.`

  return c.render(<CourseDetailPage courseslug={courseslug} />, {
    title: course.title,
    description,
    canonicalPath: `/courses/${courseslug}`,
    noindex: false,
    ogImage: course.featuredImage || '/favicon.ico',
    ogType: 'article',
  })
})

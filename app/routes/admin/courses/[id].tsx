import { createRoute } from 'honox/factory'

import CourseBuilderPage from '@/islands/lms/pages/course-builder-page'

export default createRoute((c) => {
  const id = c.req.param('id')
  if (!id) {
    return c.notFound()
  }
  return c.render(<CourseBuilderPage id={id} />, {
    title: 'Admin Edit Kursus',
    description: 'Edit kursus di panel admin LMS Course Builder.',
    canonicalPath: `/admin/courses/${id}`,
    noindex: true,
    ogType: 'website',
  })
})

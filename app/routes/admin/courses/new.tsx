import { createRoute } from 'honox/factory'

import CourseBuilderPage from '@/islands/lms/pages/course-builder-page'

export default createRoute((c) => {
  return c.render(<CourseBuilderPage id='new' />, {
    title: 'Admin Kursus Baru',
    description: 'Buat kursus baru di panel admin LMS Course Builder.',
    canonicalPath: '/admin/courses/new',
    noindex: true,
    ogType: 'website',
  })
})

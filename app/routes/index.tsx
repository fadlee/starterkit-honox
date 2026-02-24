import { createRoute } from 'honox/factory'

import { getSessionUser } from '@/lib/server/api-auth'
import { getSiteSettings, listCourses } from '@/lib/server/lms-store'
import { HomePage } from '@/components/lms/home-page'

export default createRoute(async (c) => {
  const [courses, user, siteSettings] = await Promise.all([
    listCourses(c.env.LMS_DB),
    getSessionUser(c),
    getSiteSettings(c.env.LMS_DB),
  ])

  return c.render(<HomePage courses={courses} user={user} siteSettings={siteSettings} />, {
    title: 'Katalog Kursus',
    description: 'Temukan dan ikuti kursus terbaik di LMS Course Builder.',
    canonicalPath: '/',
    noindex: false,
    ogType: 'website',
  })
})

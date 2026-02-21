import { createRoute } from 'honox/factory'

import DashboardPage from '@/islands/lms/pages/dashboard-page'

export default createRoute((c) => {
  return c.render(<DashboardPage />, {
    title: 'Katalog Kursus',
    description: 'Temukan dan ikuti kursus terbaik di LMS Course Builder.',
    canonicalPath: '/',
    noindex: false,
    ogType: 'website',
  })
})

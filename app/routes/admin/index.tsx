import { createRoute } from 'honox/factory'

import AdminGatePage from '@/islands/lms/pages/admin-gate-page'

export default createRoute((c) => {
  return c.render(<AdminGatePage />, {
    title: 'Admin',
    description: 'Halaman admin LMS Course Builder.',
    canonicalPath: '/admin',
    noindex: true,
    ogType: 'website',
  })
})

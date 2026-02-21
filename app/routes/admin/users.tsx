import { createRoute } from 'honox/factory'

import UserManagementPage from '@/islands/lms/pages/user-management-page'

export default createRoute((c) => {
  return c.render(<UserManagementPage />, {
    title: 'Admin Pengguna',
    description: 'Manajemen pengguna admin LMS Course Builder.',
    canonicalPath: '/admin/users',
    noindex: true,
    ogType: 'website',
  })
})

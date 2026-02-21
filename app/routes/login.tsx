import { createRoute } from 'honox/factory'

import LoginPage from '@/islands/lms/pages/login-page'

export default createRoute((c) => {
  return c.render(<LoginPage />, {
    title: 'Masuk',
    description: 'Masuk atau daftar ke LMS Course Builder untuk melanjutkan belajar.',
    canonicalPath: '/login',
    noindex: false,
    ogType: 'website',
  })
})

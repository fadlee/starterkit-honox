import { createRoute } from 'honox/factory'

import { resolveSiteUrl } from '@/lib/seo'

export default createRoute((c) => {
  const siteUrl = resolveSiteUrl(c)

  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api',
    `Sitemap: ${siteUrl}/sitemap.xml`,
  ].join('\n')

  c.header('content-type', 'text/plain; charset=utf-8')
  c.header('cache-control', 'public, max-age=3600')
  return c.body(body)
})

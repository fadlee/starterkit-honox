import { jsxRenderer } from 'hono/jsx-renderer'
import { Link } from 'honox/server'

import DialogController from '@/islands/ui/dialog-controller'
import DropdownMenuController from '@/islands/ui/dropdown-menu-controller'
import PopoverController from '@/islands/ui/popover-controller'
import SelectController from '@/islands/ui/select-controller'
import TabsController from '@/islands/ui/tabs-controller'
import TooltipController from '@/islands/ui/tooltip-controller'
import ToastViewport from '@/islands/ui/toast-viewport'
import { buildRobots, SEO_DEFAULT_DESCRIPTION, SEO_DEFAULT_TITLE, SEO_SITE_NAME, toAbsoluteUrl } from '@/lib/seo'

const resolveClientEntrySrc = () => {
  if (!import.meta.env.PROD) {
    return '/app/client.ts'
  }

  const MANIFEST = import.meta.glob('/dist/.vite/manifest.json', { eager: true })
  let manifest: Record<string, { file?: string }> | undefined

  for (const [, manifestFile] of Object.entries(MANIFEST)) {
    const maybeDefault = (manifestFile as { default?: unknown }).default
    if (maybeDefault && typeof maybeDefault === 'object') {
      manifest = maybeDefault as Record<string, { file?: string }>
      break
    }
  }

  const entry = manifest?.['app/client.ts']
  const file = entry?.file
  if (!file) {
    return undefined
  }

  const baseUrl = import.meta.env.BASE_URL || '/'
  const baseWithSlash = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`
  return `${baseWithSlash}${file}`
}

export default jsxRenderer(({ children, title, description, canonicalPath, noindex, ogImage, ogType }, c) => {
  const clientEntrySrc = resolveClientEntrySrc()
  const pageTitle = title || SEO_DEFAULT_TITLE
  const pageDescription = description || SEO_DEFAULT_DESCRIPTION
  const canonicalUrl = toAbsoluteUrl(c, canonicalPath || new URL(c.req.url).pathname)
  const robots = buildRobots(Boolean(noindex))
  const openGraphImage = toAbsoluteUrl(c, ogImage || '/favicon.ico')
  const openGraphType = ogType || 'website'

  return (
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content={robots} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content={openGraphType} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content={openGraphImage} />
        <meta property="og:site_name" content={SEO_SITE_NAME} />
        <meta property="og:locale" content="id_ID" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={openGraphImage} />

        <link rel="icon" href="/favicon.ico" />
        <Link href="/app/style.css" rel="stylesheet" />
        {/* Load client entry on all pages (not gated on islands) */}
        {clientEntrySrc && <script type="module" src={clientEntrySrc} />}
      </head>
      <body>
        {children}
        <DialogController />
        <DropdownMenuController />
        <PopoverController />
        <SelectController />
        <TabsController />
        <TooltipController />
        <ToastViewport />
      </body>
    </html>
  )
})

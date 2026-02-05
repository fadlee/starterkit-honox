import { jsxRenderer } from 'hono/jsx-renderer'
import { Link } from 'honox/server'

import DialogController from '@/islands/ui/dialog-controller'
import DropdownMenuController from '@/islands/ui/dropdown-menu-controller'
import PopoverController from '@/islands/ui/popover-controller'
import SelectController from '@/islands/ui/select-controller'
import TabsController from '@/islands/ui/tabs-controller'
import TooltipController from '@/islands/ui/tooltip-controller'
import ToastViewport from '@/islands/ui/toast-viewport'

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

export default jsxRenderer(({ children }) => {
  const clientEntrySrc = resolveClientEntrySrc()

  return (
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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

import type {} from 'hono'

export type SeoHead = {
  title?: string
  description?: string
  canonicalPath?: string
  noindex?: boolean
  ogImage?: string
  ogType?: 'website' | 'article'
}

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, head?: SeoHead): Response | Promise<Response>
  }

  interface Env {
    Variables: {}
    Bindings: {
      LMS_DB: D1Database
      SITE_URL?: string
    }
  }
}

import type {} from 'hono'

declare module 'hono' {
  interface Env {
    Variables: {}
    Bindings: {
      LMS_DB: D1Database
    }
  }
}

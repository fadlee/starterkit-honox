import { showRoutes } from 'hono/dev'
import { createApp } from 'honox/server'

const app = createApp({
  ROUTES: import.meta.glob(
    [
      '/app/routes/**/!(_*|-*|$*|*.test|*.spec).(ts|tsx|mdx)',
      '/app/routes/.well-known/**/!(_*|-*|$*|*.test|*.spec).(ts|tsx|mdx)',
      '!/app/routes/**/-*/**/*',
    ],
    {
      eager: true,
    }
  ),
})

showRoutes(app)

export default app

import { showRoutes } from 'hono/dev'
import { trimTrailingSlash } from 'hono/trailing-slash'
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

app.use('*', trimTrailingSlash())

app.use('/api/*', async (c, next) => {
  c.header('X-Robots-Tag', 'noindex, nofollow')
  await next()
})

showRoutes(app)

export default app

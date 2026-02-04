import { createRoute } from 'honox/factory'
import SpaRouter from '@/islands/spa-router'

export default createRoute((c) => {
  return c.render(
    <div class="py-8 px-4 mx-auto max-w-xl">
      <h1 class="text-3xl font-bold mb-2">SPA Router Demo</h1>
      <p class="text-sm opacity-70">
        Client-side routing with hash URLs (e.g. <span class="font-mono">#/users/123</span>).
      </p>

      <nav class="mt-6 space-x-4">
        <a class="underline" href="/">Home</a>
        <a class="underline" href="/demo/clock">Clock</a>
      </nav>

      <div class="mt-6">
        <SpaRouter />
      </div>
    </div>
  )
})

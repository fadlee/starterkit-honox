import { createRoute } from 'honox/factory'
import TodosSpa from '@/islands/todos-spa'

export default createRoute((c) => {
  return c.render(
    <div class="py-8 px-4 mx-auto max-w-xl">
      <h1 class="text-3xl font-bold mb-6">SPA Data Demo</h1>

      <nav class="mb-8 space-x-4">
        <a class="underline" href="/">Home</a>
        <a class="underline" href="/demo/data/ssr">SSR Demo</a>
      </nav>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold mb-4">Todos (Client-Side Rendered)</h2>
        <TodosSpa />
      </div>
    </div>
  )
})

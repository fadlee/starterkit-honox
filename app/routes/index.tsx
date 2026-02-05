import { createRoute } from 'honox/factory'

export default createRoute((c) => {
  const name = c.req.query('name') ?? 'Hono'
  return c.render(
    <div class="py-8 px-4 mx-auto max-w-xl">
      <title>{name}</title>
      <h1 class="text-3xl font-bold">Hello, {name}!</h1>

      <div class="mt-6">
        <h2 class="text-lg font-semibold">Demos</h2>
        <div class="mt-2 flex flex-col gap-2">
          <a class="underline" href="/demo/counter">
            /demo/counter
          </a>
          <a class="underline" href="/demo/clock">
            /demo/clock
          </a>
          <a class="underline" href="/demo/data/ssr">
            /demo/data/ssr
          </a>
          <a class="underline" href="/demo/data/spa">
            /demo/data/spa
          </a>
          <a class="underline" href="/demo/form">
            /demo/form
          </a>
          <a class="underline" href="/demo/router">
            /demo/router
          </a>
          <a class="underline" href="/demo/ui">
            /demo/ui
          </a>
          <a class="underline" href="/demo/hello/Hono">
            /demo/hello/:name
          </a>
        </div>
      </div>
    </div>
  )
})

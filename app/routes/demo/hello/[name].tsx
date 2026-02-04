import { createRoute } from 'honox/factory'

function HelloPage(props: { name: string }) {
  return (
    <div class="py-8 px-4 mx-auto max-w-xl">
      <h1 class="text-3xl font-bold">Hello, {props.name}!</h1>
      <p class="mt-6">
        <a class="underline" href="/demo/clock">
          Demo clock
        </a>
      </p>
      <p class="mt-2">
        <a class="underline" href="/">
          Home
        </a>
      </p>
    </div>
  )
}

export default createRoute((c) => {
  const name = c.req.param('name')
  if (!name) return c.notFound()
  return c.render(<HelloPage name={name} />)
})

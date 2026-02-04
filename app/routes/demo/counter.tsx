import { createRoute } from 'honox/factory'
import Counter from '../../islands/counter'

function CounterPage(props: { now: Date }) {
  const iso = props.now.toISOString()
  return (
    <div class="py-8 px-4 mx-auto max-w-xl">
      <h1 class="text-3xl font-bold">Counter</h1>
      <Counter />
      <p class="mt-6">
        <a class="underline" href="/">
          Home
        </a>
      </p>
    </div>
  )
}

export default createRoute((c) => {
  return c.render(<CounterPage now={new Date()} />)
})

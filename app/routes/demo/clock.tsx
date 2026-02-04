import { createRoute } from 'honox/factory'
import Clock from '../../islands/clock'

function ClockPage(props: { now: Date }) {
  const iso = props.now.toISOString()
  return (
    <div class="py-8 px-4 mx-auto max-w-xl">
      <h1 class="text-3xl font-bold">Clock</h1>
      <p class="mt-4 text-sm opacity-70">Server time (ISO)</p>
      <Clock initialIso={iso} />
      <p class="mt-6 text-sm opacity-70">Refresh to update.</p>
      <p class="mt-6">
        <a class="underline" href="/">
          Home
        </a>
      </p>
    </div>
  )
}

export default createRoute((c) => {
  return c.render(<ClockPage now={new Date()} />)
})

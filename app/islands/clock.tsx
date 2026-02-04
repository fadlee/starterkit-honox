import { useEffect, useState } from 'hono/jsx'

type Props = {
  initialIso: string
}

export default function Clock(props: Props) {
  const [iso, setIso] = useState(props.initialIso)

  useEffect(() => {
    const id = setInterval(() => {
      setIso(new Date().toISOString())
    }, 1000)
    return () => clearInterval(id)
  }, [])

  return <p class="mt-2 font-mono text-lg">{iso}</p>
}

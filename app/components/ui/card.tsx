import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type CardProps = JSX.IntrinsicElements['div']

export function Card(props: CardProps) {
  const { class: className, ...rest } = props
  return (
    <div
      class={cn('rounded-[--radius] border border-[hsl(var(--border))] bg-white shadow-sm', className)}
      {...rest}
    />
  )
}

export function CardHeader(props: CardProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 p-6', className)} {...rest} />
}

export function CardTitle(props: JSX.IntrinsicElements['h3']) {
  const { class: className, ...rest } = props
  return <h3 class={cn('text-lg font-semibold leading-none tracking-tight', className)} {...rest} />
}

export function CardDescription(props: JSX.IntrinsicElements['p']) {
  const { class: className, ...rest } = props
  return <p class={cn('text-sm text-[hsl(var(--muted-foreground))]', className)} {...rest} />
}

export function CardContent(props: CardProps) {
  const { class: className, ...rest } = props
  return <div class={cn('p-6 pt-0', className)} {...rest} />
}

export function CardFooter(props: CardProps) {
  const { class: className, ...rest } = props
  return <div class={cn('flex items-center p-6 pt-0', className)} {...rest} />
}

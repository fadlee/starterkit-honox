import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type LabelProps = JSX.IntrinsicElements['label'] & {
  htmlFor: string
}

export function Label(props: LabelProps) {
  const { class: className, htmlFor, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      for={htmlFor}
      htmlFor={htmlFor}
      class={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', className)}
      {...rest}
    >
      {children}
    </label>
  )
}

import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type PopoverProps = JSX.IntrinsicElements['div'] & {
  id: string
}

export function Popover(props: PopoverProps) {
  const { id, class: className, ...rest } = props
  return <div data-ui-popover-root data-popover-id={id} class={cn('contents', className)} {...rest} />
}

export type PopoverTriggerProps = JSX.IntrinsicElements['span'] & {
  popoverId: string
}

export function PopoverTrigger(props: PopoverTriggerProps) {
  const { popoverId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <span
      data-ui-popover-trigger
      data-popover-id={popoverId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

export type PopoverContentProps = JSX.IntrinsicElements['div'] & {
  popoverId: string
  side?: 'bottom' | 'top'
  align?: 'start' | 'center' | 'end'
}

export function PopoverContent(props: PopoverContentProps) {
  const { popoverId, side = 'bottom', align = 'center', class: className, ...rest } = props
  return (
    <div
      data-ui-popover-content
      data-popover-id={popoverId}
      data-side={side}
      data-align={align}
      data-state="closed"
      class={cn(
        'fixed z-50 hidden min-w-40 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-white p-3 shadow-lg outline-none',
        className
      )}
      tabIndex={-1}
      {...rest}
    />
  )
}

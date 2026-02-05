import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type TooltipProps = JSX.IntrinsicElements['div'] & {
  id: string
}

export function Tooltip(props: TooltipProps) {
  const { id, class: className, ...rest } = props
  return <div data-ui-tooltip-root data-tooltip-id={id} class={cn('contents', className)} {...rest} />
}

export type TooltipTriggerProps = JSX.IntrinsicElements['span'] & {
  tooltipId: string
}

export function TooltipTrigger(props: TooltipTriggerProps) {
  const { tooltipId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    <span
      data-ui-tooltip-trigger
      data-tooltip-id={tooltipId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

export type TooltipContentProps = JSX.IntrinsicElements['div'] & {
  tooltipId: string
  side?: 'bottom' | 'top'
  align?: 'start' | 'center' | 'end'
}

export function TooltipContent(props: TooltipContentProps) {
  const { tooltipId, side = 'top', align = 'center', class: className, ...rest } = props
  return (
    <div
      data-ui-tooltip-content
      data-tooltip-id={tooltipId}
      data-side={side}
      data-align={align}
      data-state="closed"
      class={cn(
        'fixed z-50 hidden rounded-md bg-black px-2.5 py-1.5 text-xs text-white shadow-lg',
        className
      )}
      role="tooltip"
      {...rest}
    />
  )
}

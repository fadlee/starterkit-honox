import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type SelectProps = JSX.IntrinsicElements['div'] & {
  id: string
  name?: string
  defaultValue?: string
}

export function Select(props: SelectProps) {
  const { id, name, defaultValue, class: className, ...rest } = props
  return (
    <div
      data-ui-select-root
      data-select-id={id}
      data-name={name ?? ''}
      data-value={defaultValue ?? ''}
      class={cn('contents', className)}
      {...rest}
    />
  )
}

export type SelectTriggerProps = JSX.IntrinsicElements['button'] & {
  selectId: string
  placeholder?: string
}

export function SelectTrigger(props: SelectTriggerProps) {
  const { selectId, placeholder = 'Select...', class: className, type, ...rest } = props
  return (
    <button
      type={type ?? 'button'}
      data-ui-select-trigger
      data-select-id={selectId}
      class={cn(
        'inline-flex h-10 w-full items-center justify-between rounded-[var(--radius)] border border-[hsl(var(--border))] bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--background))]',
        className
      )}
      {...rest}
    >
      <span data-ui-select-value data-select-id={selectId} class="truncate text-left">
        {placeholder}
      </span>
      <span class="ml-2 text-xs opacity-70">▾</span>
    </button>
  )
}

export type SelectContentProps = JSX.IntrinsicElements['div'] & {
  selectId: string
  side?: 'bottom' | 'top'
  align?: 'start' | 'center' | 'end'
}

export function SelectContent(props: SelectContentProps) {
  const { selectId, side = 'bottom', align = 'start', class: className, ...rest } = props
  return (
    <div
      data-ui-select-content
      data-select-id={selectId}
      data-side={side}
      data-align={align}
      data-state="closed"
      class={cn(
        'fixed z-50 hidden min-w-44 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-white p-1 shadow-lg outline-none',
        className
      )}
      role="listbox"
      tabIndex={-1}
      {...rest}
    />
  )
}

export type SelectItemProps = JSX.IntrinsicElements['div'] & {
  value: string
  disabled?: boolean
}

export function SelectItem(props: SelectItemProps) {
  const { value, disabled, class: className, ...rest } = props
  return (
    <div
      data-ui-select-item
      data-value={value}
      data-disabled={disabled ? 'true' : 'false'}
      role="option"
      aria-selected="false"
      tabIndex={-1}
      class={cn(
        'flex cursor-default select-none items-center rounded-[calc(var(--radius)-0.25rem)] px-2 py-1.5 text-sm outline-none hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 data-[state=active]:bg-[hsl(var(--muted))]',
        className
      )}
      {...rest}
    />
  )
}

import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type DropdownMenuProps = JSX.IntrinsicElements['div'] & {
  id: string
}

export function DropdownMenu(props: DropdownMenuProps) {
  const { id, class: className, ...rest } = props
  return <div data-ui-dropdown-root data-dropdown-id={id} class={cn('contents', className)} {...rest} />
}

export type DropdownMenuTriggerProps = JSX.IntrinsicElements['span'] & {
  dropdownId: string
}

export function DropdownMenuTrigger(props: DropdownMenuTriggerProps) {
  const { dropdownId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    <span
      data-ui-dropdown-trigger
      data-dropdown-id={dropdownId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

export type DropdownMenuContentProps = JSX.IntrinsicElements['div'] & {
  dropdownId: string
  side?: 'bottom' | 'top'
  align?: 'start' | 'center' | 'end'
}

export function DropdownMenuContent(props: DropdownMenuContentProps) {
  const { dropdownId, side = 'bottom', align = 'start', class: className, ...rest } = props
  return (
    <div
      data-ui-dropdown-content
      data-dropdown-id={dropdownId}
      data-side={side}
      data-align={align}
      data-state="closed"
      class={cn(
        'fixed z-50 hidden min-w-44 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-white p-1 shadow-lg outline-none',
        className
      )}
      role="menu"
      tabIndex={-1}
      {...rest}
    />
  )
}

export type DropdownMenuItemProps = JSX.IntrinsicElements['div'] & {
  disabled?: boolean
  href?: string
  toastTitle?: string
  toastDescription?: string
}

export function DropdownMenuItem(props: DropdownMenuItemProps) {
  const { disabled, href, toastTitle, toastDescription, class: className, ...rest } = props
  return (
    <div
      data-ui-dropdown-item
      data-disabled={disabled ? 'true' : 'false'}
      data-href={href ?? ''}
      data-toast-title={toastTitle ?? ''}
      data-toast-description={toastDescription ?? ''}
      role="menuitem"
      tabIndex={-1}
      class={cn(
        'flex cursor-default select-none items-center rounded-[calc(var(--radius)-0.25rem)] px-2 py-1.5 text-sm outline-none hover:bg-[hsl(var(--muted))] focus:bg-[hsl(var(--muted))] data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className
      )}
      {...rest}
    />
  )
}

export function DropdownMenuSeparator(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <hr class={cn('my-1 h-px border-0 bg-[hsl(var(--border))]', className)} {...(rest as any)} />
}

export function DropdownMenuLabel(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div class={cn('px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]', className)} {...rest} />
}

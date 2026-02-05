import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type AlertDialogProps = JSX.IntrinsicElements['div'] & {
  id: string
}

export function AlertDialog(props: AlertDialogProps) {
  const { id, class: className, ...rest } = props
  return <div data-ui-alert-dialog-root data-alert-dialog-id={id} class={cn('contents', className)} {...rest} />
}

export type AlertDialogTriggerProps = JSX.IntrinsicElements['span'] & {
  dialogId: string
}

export function AlertDialogTrigger(props: AlertDialogTriggerProps) {
  const { dialogId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <span
      data-ui-alert-dialog-trigger
      data-alert-dialog-id={dialogId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

export type AlertDialogContentProps = JSX.IntrinsicElements['div'] & {
  dialogId: string
  size?: 'sm' | 'md' | 'lg'
}

export function AlertDialogContent(props: AlertDialogContentProps) {
  const { dialogId, size = 'md', class: className, ...rest } = props
  const titleId = `${dialogId}-title`
  const descriptionId = `${dialogId}-description`

  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div
      data-ui-alert-dialog-wrapper
      data-alert-dialog-id={dialogId}
      data-state="closed"
      data-dismissible="false"
      data-close-on-esc="false"
      data-close-on-overlay="false"
      class="fixed inset-0 z-50 hidden m-0"
    >
      <div
        data-ui-alert-dialog-overlay
        data-alert-dialog-id={dialogId}
        class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-ui-alert-dialog-content
        data-alert-dialog-id={dialogId}
        class={cn(
          'absolute left-1/2 top-1/2 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-white p-6 shadow-lg outline-none',
          sizeClass,
          className
        )}
        {...rest}
      />
    </div>
  )
}

export function AlertDialogHeader(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 text-left', className)} {...rest} />
}

export type AlertDialogTitleProps = JSX.IntrinsicElements['h2'] & {
  dialogId: string
}

export function AlertDialogTitle(props: AlertDialogTitleProps) {
  const { dialogId, class: className, ...rest } = props
  return (
    <h2
      id={`${dialogId}-title`}
      class={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...rest}
    />
  )
}

export type AlertDialogDescriptionProps = JSX.IntrinsicElements['p'] & {
  dialogId: string
}

export function AlertDialogDescription(props: AlertDialogDescriptionProps) {
  const { dialogId, class: className, ...rest } = props
  return (
    <p
      id={`${dialogId}-description`}
      class={cn('text-sm text-[hsl(var(--muted-foreground))]', className)}
      {...rest}
    />
  )
}

export function AlertDialogFooter(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div class={cn('mt-6 flex items-center justify-end gap-2', className)} {...rest} />
}

export type AlertDialogActionProps = JSX.IntrinsicElements['span'] & {
  dialogId: string
}

export function AlertDialogAction(props: AlertDialogActionProps) {
  const { dialogId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <span
      data-ui-alert-dialog-action
      data-alert-dialog-id={dialogId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

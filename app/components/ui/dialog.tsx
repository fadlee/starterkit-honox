import type { JSX } from 'hono/jsx'

import { cn } from '@/lib/cn'

export type DialogProps = JSX.IntrinsicElements['div'] & {
  id: string
}

export function Dialog(props: DialogProps) {
  const { id, class: className, ...rest } = props
  return <div data-ui-dialog-root data-dialog-id={id} class={cn('contents', className)} {...rest} />
}

export type DialogTriggerProps = JSX.IntrinsicElements['span'] & {
  dialogId: string
}

export function DialogTrigger(props: DialogTriggerProps) {
  const { dialogId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <span
      data-ui-dialog-trigger
      data-dialog-id={dialogId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

export type DialogContentProps = JSX.IntrinsicElements['div'] & {
  dialogId: string
  size?: 'sm' | 'md' | 'lg'
  dismissible?: boolean
  closeOnEsc?: boolean
  closeOnOverlay?: boolean
}

export function DialogContent(props: DialogContentProps) {
  const {
    dialogId,
    size = 'md',
    dismissible = true,
    closeOnEsc: closeOnEscProp = true,
    closeOnOverlay: closeOnOverlayProp = true,
    class: className,
    ...rest
  } = props

  const closeOnEsc = dismissible ? closeOnEscProp : false
  const closeOnOverlay = dismissible ? closeOnOverlayProp : false
  const titleId = `${dialogId}-title`
  const descriptionId = `${dialogId}-description`

  const sizeClass = size === 'sm' ? 'max-w-sm' : size === 'lg' ? 'max-w-2xl' : 'max-w-lg'

  return (
    <div
      data-ui-dialog-wrapper
      data-dialog-id={dialogId}
      data-state="closed"
      data-dismissible={dismissible ? 'true' : 'false'}
      data-close-on-esc={closeOnEsc ? 'true' : 'false'}
      data-close-on-overlay={closeOnOverlay ? 'true' : 'false'}
      class="fixed inset-0 z-50 hidden m-0"
    >
      <div
        data-ui-dialog-overlay
        data-dialog-id={dialogId}
        class="absolute inset-0 bg-black/50 backdrop-blur-[1px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        data-ui-dialog-content
        data-dialog-id={dialogId}
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

export function DialogHeader(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div class={cn('flex flex-col space-y-1.5 text-left', className)} {...rest} />
}

export function DialogBody(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return (
    <div
      class={cn(
        'mt-4 max-h-[min(60vh,32rem)] overflow-auto pr-2 -mr-2',
        className
      )}
      {...rest}
    />
  )
}

export type DialogTitleProps = JSX.IntrinsicElements['h2'] & {
  dialogId: string
}

export function DialogTitle(props: DialogTitleProps) {
  const { dialogId, class: className, ...rest } = props
  return (
    <h2
      id={`${dialogId}-title`}
      class={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...rest}
    />
  )
}

export type DialogDescriptionProps = JSX.IntrinsicElements['p'] & {
  dialogId: string
}

export function DialogDescription(props: DialogDescriptionProps) {
  const { dialogId, class: className, ...rest } = props
  return (
    <p
      id={`${dialogId}-description`}
      class={cn('text-sm text-[hsl(var(--muted-foreground))]', className)}
      {...rest}
    />
  )
}

export function DialogFooter(props: JSX.IntrinsicElements['div']) {
  const { class: className, ...rest } = props
  return <div class={cn('mt-6 flex items-center justify-end gap-2', className)} {...rest} />
}

export type DialogCloseProps = JSX.IntrinsicElements['span'] & {
  dialogId: string
}

export function DialogClose(props: DialogCloseProps) {
  const { dialogId, class: className, children, ...rest } = props
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
    // eslint-disable-next-line jsx-a11y/prefer-tag-over-role
    // eslint-disable-next-line jsx-a11y/interactive-supports-focus
    <span
      data-ui-dialog-close
      data-dialog-id={dialogId}
      role="button"
      tabIndex={0}
      class={className}
      {...rest}
    >
      {children}
    </span>
  )
}

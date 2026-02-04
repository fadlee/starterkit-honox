import '@hotwired/turbo'
import { createClient } from 'honox/client'

createClient()

addEventListener('turbo:load', () => {
  createClient()
})

addEventListener('turbo:before-cache', () => {
  // Turbo restores cached DOM snapshots without JS event listeners.
  // Remove this marker so Honox can re-hydrate islands on restore.
  for (const el of Array.from(document.querySelectorAll('[data-hono-hydrated="true"]'))) {
    el.removeAttribute('data-hono-hydrated')
  }
})

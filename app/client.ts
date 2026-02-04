import '@hotwired/turbo'
import { createClient } from 'honox/client'

createClient()

addEventListener('turbo:load', () => {
  createClient()
})

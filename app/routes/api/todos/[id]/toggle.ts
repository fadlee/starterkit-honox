import { createRoute } from 'honox/factory'
import { toggleTodo } from '@/lib/todos'

export const POST = createRoute(async (c) => {
  c.header('cache-control', 'no-store')
  
  const idParam = c.req.param('id')
  const id = parseInt(idParam || '', 10)
  
  if (isNaN(id)) {
    return c.json({ error: 'not found' }, 404)
  }

  const todo = toggleTodo(id)
  if (!todo) {
    return c.json({ error: 'not found' }, 404)
  }
  return c.json(todo, 200)
})

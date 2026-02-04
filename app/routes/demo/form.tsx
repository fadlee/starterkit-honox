import { createRoute } from 'honox/factory'

import { addTodo, getTodos, type Todo } from '@/lib/todos'

export default createRoute(async (c) => {
  try {
    const todos: Todo[] = getTodos()
    
    return c.render(
      <div class="py-8 px-4 mx-auto max-w-xl">
        <h1 class="text-3xl font-bold mb-6">Form Demo</h1>
        
        <nav class="mb-8 space-x-4">
          <a class="underline" href="/">Home</a>
          <a class="underline" href="/demo/data/ssr">SSR Demo</a>
        </nav>
        
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
            <form method="post" action="/demo/form" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium mb-1">
                  Todo Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter todo title..."
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Todo
              </button>
            </form>
          </div>
          
          <div>
            <h2 class="text-xl font-semibold mb-4">Current Todos</h2>
            {todos.length === 0 ? (
              <p>No todos found.</p>
            ) : (
              <ul class="space-y-2">
                {todos.map((todo) => (
                  <li 
                    key={todo.id}
                    class={`p-3 border rounded ${todo.completed ? 'bg-gray-50 line-through' : 'bg-white'}`}
                  >
                    <span class={todo.completed ? 'text-gray-500' : ''}>
                      {todo.title}
                    </span>
                    <span class="ml-2 text-sm text-gray-500">
                      ({todo.completed ? 'completed' : 'pending'})
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    )
  } catch (error) {
    return c.render(
      <div class="py-8 px-4 mx-auto max-w-xl">
        <h1 class="text-3xl font-bold mb-6">Form Demo</h1>
        
        <nav class="mb-8 space-x-4">
          <a class="underline" href="/">Home</a>
          <a class="underline" href="/demo/data/ssr">SSR Demo</a>
        </nav>
        
        <div class="space-y-6">
          <div>
            <h2 class="text-xl font-semibold mb-4">Add New Todo</h2>
            <form method="post" action="/demo/form" class="space-y-4">
              <div>
                <label for="title" class="block text-sm font-medium mb-1">
                  Todo Title
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter todo title..."
                />
              </div>
              <button
                type="submit"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Add Todo
              </button>
            </form>
          </div>
          
          <div class="p-4 bg-red-50 border border-red-200 rounded">
            <h2 class="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p class="text-red-700">
              Failed to load todos from the API. 
              {error instanceof Error ? ` ${error.message}` : ' Unknown error occurred.'}
            </p>
          </div>
        </div>
      </div>
    )
  }
})

export const POST = createRoute(async (c) => {
  try {
    const body = await c.req.parseBody()
    const title = body.title as string
    
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return c.redirect('/demo/form')
    }
    
    addTodo(title)
    return c.redirect('/demo/form')
  } catch (error) {
    return c.redirect('/demo/form')
  }
})

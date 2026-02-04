import { createRoute } from 'honox/factory'

import { getTodos, type Todo } from '@/lib/todos'

export default createRoute(async (c) => {
  try {
    const todos: Todo[] = getTodos()
    
    return c.render(
      <div class="py-8 px-4 mx-auto max-w-xl">
        <h1 class="text-3xl font-bold mb-6">SSR Data Demo</h1>
        
        <nav class="mb-8 space-x-4">
          <a class="underline" href="/">Home</a>
          <a class="underline" href="/demo/data/spa">SPA Demo</a>
        </nav>
        
        <div class="space-y-2">
          <h2 class="text-xl font-semibold mb-4">Todos (Server-Side Rendered)</h2>
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
    )
  } catch (error) {
    return c.render(
      <div class="py-8 px-4 mx-auto max-w-xl">
        <h1 class="text-3xl font-bold mb-6">SSR Data Demo</h1>
        
        <nav class="mb-8 space-x-4">
          <a class="underline" href="/">Home</a>
          <a class="underline" href="/demo/data/spa">SPA Demo</a>
        </nav>
        
        <div class="p-4 bg-red-50 border border-red-200 rounded">
          <h2 class="text-xl font-semibold text-red-800 mb-2">Error</h2>
          <p class="text-red-700">
            Failed to load todos from the API. 
            {error instanceof Error ? ` ${error.message}` : ' Unknown error occurred.'}
          </p>
        </div>
      </div>
    )
  }
})

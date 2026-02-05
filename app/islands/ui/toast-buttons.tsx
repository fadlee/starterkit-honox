import { toast } from '@/lib/toast'
import { Button } from '@/components/ui/button'

export default function ToastButtons() {
  return (
    <div class="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Saved', description: 'Your settings are up to date.', variant: 'success' })}
      >
        Success Toast
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast({
            title: 'Needs review',
            description: 'Click to view details.',
            actionLabel: 'View',
            onAction: () => {
              window.location.href = '/demo/ui'
            }
          })
        }
      >
        Toast With Action
      </Button>
      <Button
        variant="secondary"
        onClick={() => toast({ title: 'Something went wrong', description: 'Try again in a moment.', variant: 'error' })}
      >
        Error Toast
      </Button>
      <Button onClick={() => toast({ title: 'Hello', description: 'This is a basic toast.' })}>Default Toast</Button>
    </div>
  )
}

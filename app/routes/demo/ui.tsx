import { createRoute } from 'honox/factory'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import ToastButtons from '@/islands/ui/toast-buttons'

export default createRoute((c) => {
  return c.render(
    <div class="py-8 px-4 mx-auto max-w-2xl">
      <h1 class="text-3xl font-bold">UI Kit Demo</h1>
      <p class="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
        Shadcn-inspired primitives (Hono JSX + Honox islands).
      </p>

      <nav class="mt-6 space-x-4">
        <a class="underline" href="/">Home</a>
        <a class="underline" href="/demo/form">Form Demo</a>
      </nav>

      <Separator class="my-8" />

      <div class="space-y-10">
        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Buttons</h2>
            <Badge variant="secondary">primitives</Badge>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Card + Form Bits</h2>
            <Badge variant="outline">layout</Badge>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>Basic input styling with consistent focus ring.</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" placeholder="name@example.com" />
              </div>
              <div class="space-y-2">
                <Label htmlFor="name">Display name</Label>
                <Input id="name" placeholder="Fadlee" />
              </div>
            </CardContent>
            <CardFooter class="justify-end gap-2">
              <Button variant="secondary">Cancel</Button>
              <Button>Save</Button>
            </CardFooter>
          </Card>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Tabs</h2>
            <Badge variant="secondary">manual activation</Badge>
          </div>
          <Tabs id="profile-tabs" defaultValue="account">
            <TabsList>
              <TabsTrigger tabsId="profile-tabs" value="account">
                Account
              </TabsTrigger>
              <TabsTrigger tabsId="profile-tabs" value="security">
                Security
              </TabsTrigger>
              <TabsTrigger tabsId="profile-tabs" value="billing">
                Billing
              </TabsTrigger>
            </TabsList>
            <TabsContent tabsId="profile-tabs" value="account">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Arrow keys move focus; Enter activates.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm">Try Left/Right/Home/End on the tabs.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent tabsId="profile-tabs" value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security</CardTitle>
                  <CardDescription>Manual activation keeps focus movement separate.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm">ESC won’t change tabs; only Enter/Space.</p>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent tabsId="profile-tabs" value="billing">
              <Card>
                <CardHeader>
                  <CardTitle>Billing</CardTitle>
                  <CardDescription>Content panels are hidden via controller.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p class="text-sm">Swap this out with real billing UI later.</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Dialog</h2>
            <Badge variant="outline">headless</Badge>
          </div>
          <Dialog id="delete-dialog" />
          <DialogTrigger dialogId="delete-dialog" class="">
            <Button variant="destructive">Open Dialog</Button>
          </DialogTrigger>
          <DialogContent dialogId="delete-dialog" size="sm">
            <DialogHeader>
              <DialogTitle dialogId="delete-dialog">Delete project?</DialogTitle>
              <DialogDescription dialogId="delete-dialog">
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose dialogId="delete-dialog">
                <Button variant="secondary">Cancel</Button>
              </DialogClose>
              <DialogClose dialogId="delete-dialog">
                <Button variant="destructive">Delete</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">
            Click overlay or press ESC to close.
          </p>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Dialog (Scrollable)</h2>
            <Badge variant="secondary">long content</Badge>
          </div>
          <Dialog id="scroll-dialog" />
          <DialogTrigger dialogId="scroll-dialog">
            <Button variant="secondary">Open Scrollable Dialog</Button>
          </DialogTrigger>
          <DialogContent dialogId="scroll-dialog" size="lg">
            <DialogHeader>
              <DialogTitle dialogId="scroll-dialog">Release notes</DialogTitle>
              <DialogDescription dialogId="scroll-dialog">
                Content scrolls; header/footer stay visible.
              </DialogDescription>
            </DialogHeader>
            <DialogBody>
              <div class="space-y-3 text-sm">
                {Array.from({ length: 24 }).map((_, i) => (
                  <p key={i} class="leading-6">
                    <span class="font-semibold">Item {i + 1}.</span> Lorem ipsum dolor sit amet, consectetur adipiscing
                    elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam.
                  </p>
                ))}
              </div>
            </DialogBody>
            <DialogFooter>
              <DialogClose dialogId="scroll-dialog">
                <Button variant="secondary">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Alert Dialog</h2>
            <Badge variant="secondary">action required</Badge>
          </div>
          <AlertDialog id="billing-alert" />
          <AlertDialogTrigger dialogId="billing-alert">
            <Button variant="outline">Open Alert Dialog</Button>
          </AlertDialogTrigger>
          <AlertDialogContent dialogId="billing-alert" size="md">
            <AlertDialogHeader>
              <AlertDialogTitle dialogId="billing-alert">Confirm billing change</AlertDialogTitle>
              <AlertDialogDescription dialogId="billing-alert">
                This dialog cannot be dismissed with ESC or by clicking outside. You must choose an action.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction dialogId="billing-alert">
                <Button variant="secondary">Cancel</Button>
              </AlertDialogAction>
              <AlertDialogAction dialogId="billing-alert">
                <Button>Proceed</Button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">Overlay clicks and ESC are ignored.</p>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Toasts</h2>
            <Badge variant="secondary">events</Badge>
          </div>
          <ToastButtons />
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Popover</h2>
            <Badge variant="outline">dropdown</Badge>
          </div>
          <Popover id="demo-popover" />
          <PopoverTrigger popoverId="demo-popover">
            <Button variant="outline">Open Popover</Button>
          </PopoverTrigger>
          <PopoverContent popoverId="demo-popover" side="bottom" align="start" class="w-72">
            <div class="space-y-2">
              <p class="text-sm font-semibold">Quick actions</p>
              <p class="text-sm text-[hsl(var(--muted-foreground))]">A lightweight dropdown-style popover.</p>
              <div class="flex flex-wrap gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => {
                    window.location.href = '/'
                  }}
                >
                  Home
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    window.location.href = '/demo/form'
                  }}
                >
                  Form
                </Button>
              </div>
            </div>
          </PopoverContent>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Dropdown Menu</h2>
            <Badge variant="secondary">menu roles</Badge>
          </div>
          <DropdownMenu id="demo-menu" />
          <DropdownMenuTrigger dropdownId="demo-menu">
            <Button variant="outline">Open Menu</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent dropdownId="demo-menu" align="start">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem toastTitle="Copied" toastDescription="Link copied to clipboard.">
              Copy link
            </DropdownMenuItem>
            <DropdownMenuItem toastTitle="Archived" toastDescription="Item moved to archive.">
              Archive
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Disabled item</DropdownMenuItem>
          </DropdownMenuContent>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">Use Arrow keys + typeahead; ESC closes.</p>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Select</h2>
            <Badge variant="outline">listbox</Badge>
          </div>
          <div class="max-w-sm">
            <Select id="plan" name="plan" defaultValue="pro" />
            <SelectTrigger selectId="plan" placeholder="Choose a plan" />
            <SelectContent selectId="plan" align="start">
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="team">Team</SelectItem>
            </SelectContent>
          </div>
          <p class="text-sm text-[hsl(var(--muted-foreground))]">Keyboard: Enter/Space, arrows, ESC.</p>
        </section>

        <section class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold">Tooltip</h2>
            <Badge variant="secondary">hover/focus</Badge>
          </div>
          <Tooltip id="tip-1" />
          <TooltipTrigger tooltipId="tip-1">
            <Button variant="outline">Hover me</Button>
          </TooltipTrigger>
          <TooltipContent tooltipId="tip-1" side="top" align="center">
            Opens on hover/focus, closes on ESC.
          </TooltipContent>
        </section>
      </div>
    </div>
  )
})

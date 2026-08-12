import { useRef } from "react"
import { Dialog } from "@base-ui/react/dialog"
import { LogInIcon, LogOutIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

export function CmsAdminCommandMenu({
  open,
  adminActive,
  onOpenChange,
  onEnterAdmin,
  onExitAdmin,
}: {
  readonly open: boolean
  readonly adminActive: boolean
  readonly onOpenChange: (open: boolean) => void
  readonly onEnterAdmin: () => void
  readonly onExitAdmin: () => void
}) {
  const commandRef = useRef<HTMLButtonElement | null>(null)
  const commandLabel = adminActive ? "Exit Admin mode" : "Enter Admin mode"

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[70] bg-foreground/45" />
        <Dialog.Viewport className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto px-4 py-[12vh]">
          <Dialog.Popup
            initialFocus={commandRef}
            finalFocus={false}
            className="w-full max-w-md rounded-lg border border-border bg-background p-2 font-body text-foreground shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <div className="flex items-start justify-between gap-4 px-3 pt-2 pb-3">
              <div>
                <Dialog.Title className="font-heading text-lg font-semibold">
                  Admin commands
                </Dialog.Title>
                <Dialog.Description className="mt-1 text-sm leading-5 text-muted-foreground">
                  {adminActive
                    ? "Hide page settings and section controls."
                    : "Change page settings and section order."
                  }
                </Dialog.Description>
              </div>
              <Dialog.Close
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="min-h-11 min-w-11"
                    aria-label="Close Admin commands"
                  />
                }
              >
                <XIcon aria-hidden="true" />
              </Dialog.Close>
            </div>

            <Button
              ref={commandRef}
              type="button"
              variant="ghost"
              size="lg"
              className="min-h-14 w-full justify-start px-3 text-left"
              onClick={adminActive ? onExitAdmin : onEnterAdmin}
            >
              {adminActive ? (
                <LogOutIcon aria-hidden="true" />
              ) : (
                <LogInIcon aria-hidden="true" />
              )}
              {commandLabel}
            </Button>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

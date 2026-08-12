import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"

function useModalDialog(open: boolean) {
  const ref = useRef<HTMLDialogElement | null>(null)
  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal()
      else dialog.setAttribute("open", "")
    } else if (!open && dialog.open) {
      if (typeof dialog.close === "function") dialog.close()
      else dialog.removeAttribute("open")
    }
  }, [open])
  return ref
}

const dialogClass =
  "m-auto w-[min(32rem,calc(100%-2rem))] rounded-lg border border-border bg-background p-0 font-body text-foreground shadow-xl backdrop:bg-foreground/45"

export function FinishEditingDialog({
  open,
  saving,
  errorMessage,
  onSave,
  onDiscard,
  onKeepEditing,
}: {
  readonly open: boolean
  readonly saving: boolean
  readonly errorMessage: string | null
  readonly onSave: () => void
  readonly onDiscard: () => void
  readonly onKeepEditing: () => void
}) {
  const ref = useModalDialog(open)
  return (
    <dialog
      ref={ref}
      aria-labelledby="finish-editing-title"
      className={dialogClass}
      onCancel={(event) => {
        event.preventDefault()
        if (!saving) onKeepEditing()
      }}
    >
      <div className="p-6">
        <h2
          id="finish-editing-title"
          className="font-heading text-2xl font-semibold"
        >
          Finish editing?
        </h2>
        <p className="mt-3 leading-6 text-muted-foreground">
          Save this draft, discard the changes made since your last save, or
          keep editing.
        </p>
        {errorMessage ? (
          <p
            role="alert"
            className="mt-4 border-l-2 border-destructive bg-muted px-3 py-2 text-sm text-destructive"
          >
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="min-h-11"
            disabled={saving}
            onClick={onKeepEditing}
          >
            Keep editing
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="min-h-11"
            disabled={saving}
            onClick={onDiscard}
          >
            Discard changes
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-11"
            disabled={saving}
            onClick={onSave}
            autoFocus
          >
            {saving ? "Saving draft…" : "Save and finish"}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export function PublishVersionDialog({
  open,
  publishing,
  pageTitle,
  path,
  versionNumber,
  displayName,
  onPublish,
  onCancel,
}: {
  readonly open: boolean
  readonly publishing: boolean
  readonly pageTitle: string
  readonly path: string
  readonly versionNumber: number
  readonly displayName: string
  readonly onPublish: () => void
  readonly onCancel: () => void
}) {
  const ref = useModalDialog(open)
  return (
    <dialog
      ref={ref}
      aria-labelledby="publish-version-title"
      aria-busy={publishing}
      className={dialogClass}
      onCancel={(event) => {
        event.preventDefault()
        if (!publishing) onCancel()
      }}
    >
      <div className="p-6">
        <h2
          id="publish-version-title"
          className="font-heading text-2xl font-semibold"
        >
          Publish version {versionNumber}?
        </h2>
        <p className="mt-3 leading-6 text-muted-foreground">
          This publishes{" "}
          <strong className="text-foreground">{pageTitle}</strong> at{" "}
          <strong className="text-foreground">{path}</strong> under{" "}
          {displayName || "your name"}. The released website stays unchanged
          until you approve the switch.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="min-h-11"
            aria-disabled={publishing}
            onClick={() => {
              if (!publishing) onCancel()
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="lg"
            className="min-h-11"
            aria-disabled={publishing}
            onClick={() => {
              if (!publishing) onPublish()
            }}
            autoFocus
          >
            {publishing ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

export function UnpublishPageDialog({
  open,
  unpublishing,
  pageTitle,
  onUnpublish,
  onCancel,
}: {
  readonly open: boolean
  readonly unpublishing: boolean
  readonly pageTitle: string
  readonly onUnpublish: () => void
  readonly onCancel: () => void
}) {
  const ref = useModalDialog(open)
  return (
    <dialog
      ref={ref}
      aria-labelledby="unpublish-page-title"
      aria-busy={unpublishing}
      className={dialogClass}
      onCancel={(event) => {
        event.preventDefault()
        if (!unpublishing) onCancel()
      }}
    >
      <div className="p-6">
        <h2
          id="unpublish-page-title"
          className="font-heading text-2xl font-semibold"
        >
          Unpublish this version?
        </h2>
        <p className="mt-3 leading-6 text-muted-foreground">
          This removes <strong className="text-foreground">{pageTitle}</strong>{" "}
          from the private published comparison. Its draft and version history
          stay available. The released website will not change.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="lg"
            className="min-h-11"
            aria-disabled={unpublishing}
            onClick={() => {
              if (!unpublishing) onCancel()
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            className="min-h-11"
            aria-disabled={unpublishing}
            onClick={() => {
              if (!unpublishing) onUnpublish()
            }}
            autoFocus
          >
            {unpublishing ? "Unpublishing…" : "Unpublish"}
          </Button>
        </div>
      </div>
    </dialog>
  )
}

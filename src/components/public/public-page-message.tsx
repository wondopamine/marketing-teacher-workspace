import { Button } from "@/components/ui/button"

export function PublicPageMessage({
  heading,
  children,
  action,
}: {
  readonly heading: string
  readonly children: React.ReactNode
  readonly action?: {
    readonly href: string
    readonly label: string
  }
}) {
  return (
    <main
      id="main"
      className="grid min-h-screen place-items-center bg-muted px-6 pt-[calc(var(--masthead-h)+2rem)] pb-8 font-body text-foreground"
    >
      <div className="max-w-lg border border-border bg-background p-6 text-center sm:p-8">
        <h1 className="font-heading text-3xl font-semibold">{heading}</h1>
        <p className="mt-3 leading-6 text-muted-foreground">{children}</p>
        {action ? (
          <Button asChild size="lg" className="mt-5 min-h-11">
            <a href={action.href}>{action.label}</a>
          </Button>
        ) : null}
      </div>
    </main>
  )
}

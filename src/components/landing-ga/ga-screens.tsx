import { ComposerComponent, ComposerScreen } from "./ga-screen-composer"
import { GuidanceComponent, GuidanceScreen } from "./ga-screen-guidance"
import { InsightsComponent, InsightsScreen } from "./ga-screen-insights"
import { PostComponent, PostScreen } from "./ga-screen-post"
import { ProfileComponent, ProfileScreen } from "./ga-screen-profile"

import type { GaJourneyActId } from "@/content/landing-ga-page"
import type { ReactNode } from "react"

export type ScreenProps = {
  /** Play the script. False = the settled frame, no motion. */
  readonly active: boolean
}

/**
 * The five acts' screens, one scripted demonstration each (owner,
 * 2026-08-26, after paper.design). Every screen is coded — nothing here is a
 * capture. This module is the lazily-loaded chunk; what the journey needs
 * before it arrives lives in `ga-screen-meta.ts`.
 */
export const gaActScreens: Record<
  GaJourneyActId,
  (props: ScreenProps) => ReactNode
> = {
  promise: InsightsScreen,
  notice: ProfileScreen,
  "next-steps": GuidanceScreen,
  words: ComposerScreen,
  "family-and-record": PostScreen,
}

/** One act's screen, for the journey's lazy boundary. */
export function ActScreen({
  active,
  id,
}: {
  readonly active: boolean
  readonly id: GaJourneyActId
}) {
  const Screen = gaActScreens[id]
  return <Screen active={active} />
}

/**
 * The one component each act is about — the filter, the rail that names a
 * record's sections, the suggestion, the draft picker, the delivery overview.
 * The reveal's cards turn over to these rather than to the whole screen
 * (owner, 2026-08-26): at card size a full screen is a grey smudge, and the
 * component is the part the act is actually claiming.
 */
export const gaActComponents: Record<GaJourneyActId, () => ReactNode> = {
  promise: InsightsComponent,
  notice: ProfileComponent,
  "next-steps": GuidanceComponent,
  words: ComposerComponent,
  "family-and-record": PostComponent,
}

/** One act's component, at rest, for the reveal's cards. */
export function ScreenStill({ id }: { readonly id: GaJourneyActId }) {
  const Component = gaActComponents[id]
  return <Component />
}

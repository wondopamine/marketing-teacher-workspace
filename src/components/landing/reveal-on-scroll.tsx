import { cubicBezier, motion, useInView, useReducedMotion } from "motion/react"
import { useLayoutEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

const EASE = cubicBezier(0.4, 0, 0.2, 1)

const DEFAULT_Y = 24
const DEFAULT_DURATION = 0.6

const IN_VIEW_OPTIONS = {
  once: true,
  margin: "0px 0px -15% 0px",
  amount: 0.25,
} as const

type RevealOnScrollProps = {
  children: ReactNode
  delay?: number
  className?: string
  id?: string
}

// Fade + lift reveal. Fires once per element; honors prefers-reduced-motion.
//
// The server renders the SETTLED state (never opacity:0), so no-JS readers
// and crawlers always see the complete composition. After hydration, only an
// element still below the viewport is "armed" to hide and reveal — an element
// already on screen stays visible, so there is no flash. The hide applies in
// a layout effect with zero duration, before paint.
export function RevealOnScroll({
  children,
  delay = 0,
  className,
  id,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  // === true: hydration null must not skip the animation
  const reduced = useReducedMotion() === true
  const inView = useInView(ref, IN_VIEW_OPTIONS)
  const [armed, setArmed] = useState(false)

  useLayoutEffect(() => {
    if (reduced) return
    const element = ref.current
    if (!element || typeof window === "undefined") return
    if (element.getBoundingClientRect().top > window.innerHeight) {
      setArmed(true)
    }
  }, [reduced])

  const hidden = armed && !reduced && !inView

  return (
    <motion.div
      ref={ref}
      id={id}
      className={className}
      initial={false}
      animate={hidden ? { opacity: 0, y: DEFAULT_Y } : { opacity: 1, y: 0 }}
      transition={
        hidden || reduced
          ? { duration: 0 }
          : {
              duration: DEFAULT_DURATION,
              ease: EASE,
              delay: delay / 1000,
            }
      }
    >
      {children}
    </motion.div>
  )
}

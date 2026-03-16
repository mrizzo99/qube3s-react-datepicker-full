import { useEffect, useState } from 'react'

export const FLUENT_UI_DURATION_MS = 220

type PresenceState = 'open' | 'closed'

const canUseWindow = () => typeof window !== 'undefined'

export const prefersReducedMotion = () =>
  canUseWindow() && typeof window.matchMedia === 'function'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false

export const animateMonthSlide = (element: HTMLElement, monthDelta: number) => {
  if (monthDelta === 0 || typeof element.animate !== 'function' || prefersReducedMotion()) return

  element.animate(
    [
      {
        opacity: 0.7,
        transform: `translate3d(${monthDelta > 0 ? '18px' : '-18px'}, 0, 0) scale(0.985)`,
        filter: 'blur(4px)',
      },
      {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        filter: 'blur(0)',
      },
    ],
    {
      duration: FLUENT_UI_DURATION_MS,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
    },
  )
}

export const usePresenceTransition = (
  open: boolean,
  duration = FLUENT_UI_DURATION_MS,
) => {
  const [isMounted, setIsMounted] = useState(open)
  const [presenceState, setPresenceState] = useState<PresenceState>(open ? 'open' : 'closed')

  useEffect(() => {
    if (prefersReducedMotion()) {
      setIsMounted(open)
      setPresenceState(open ? 'open' : 'closed')
      return
    }

    let frame = 0
    let timeout = 0

    if (open) {
      setIsMounted(true)
      setPresenceState('closed')
      if (canUseWindow()) {
        frame = window.requestAnimationFrame(() => {
          setPresenceState('open')
        })
      } else {
        setPresenceState('open')
      }
    } else if (isMounted) {
      setPresenceState('closed')
      if (canUseWindow()) {
        timeout = window.setTimeout(() => {
          setIsMounted(false)
        }, duration)
      } else {
        setIsMounted(false)
      }
    }

    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      if (timeout) window.clearTimeout(timeout)
    }
  }, [duration, isMounted, open])

  return { isMounted, presenceState }
}

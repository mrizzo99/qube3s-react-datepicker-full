import { autoUpdate, computePosition, flip, limitShift, offset, platform, shift, size } from '@floating-ui/react'
import { useLayoutEffect, useState } from 'react'

type FloatingPopoverOptions = {
  open: boolean
  enabled: boolean
  referenceRef: React.MutableRefObject<HTMLElement | null>
  floatingRef: React.MutableRefObject<HTMLElement | null>
  offsetPx?: number
  viewportPaddingPx?: number
}

type FloatingPopoverState = {
  left: number
  top: number
  maxHeight?: number
  maxWidth?: number
}

const round = (value: number) => Math.round(value)
const clamp = (value: number) => (Number.isFinite(value) ? Math.max(0, Math.floor(value)) : undefined)

type FloatingPlatform = typeof platform & { _c: Map<Element, unknown> }

const getViewportRect = (element: Element) => {
  const ownerWindow = element.ownerDocument.defaultView
  const documentElement = element.ownerDocument.documentElement
  const width = Math.max(ownerWindow?.innerWidth ?? 0, documentElement?.clientWidth ?? 0)
  const height = Math.max(ownerWindow?.innerHeight ?? 0, documentElement?.clientHeight ?? 0)

  if (width <= 0 || height <= 0) return null

  return {
    x: 0,
    y: 0,
    width,
    height,
  }
}

const floatingPlatform: FloatingPlatform = {
  ...platform,
  _c: new Map<Element, unknown>(),
  async getDimensions(this: FloatingPlatform, element: Element) {
    const dimensions = await platform.getDimensions.call(this, element)
    if (dimensions.width > 0 && dimensions.height > 0) return dimensions

    const rect = element.getBoundingClientRect()
    return {
      width: dimensions.width || rect.width,
      height: dimensions.height || rect.height,
    }
  },
  async getClippingRect(this: FloatingPlatform, args) {
    const rect = await platform.getClippingRect.call(this, args)
    if (rect.width > 0 && rect.height > 0) return rect

    return getViewportRect(args.element) ?? rect
  },
}

export const useFloatingPopoverPosition = ({
  open,
  enabled,
  referenceRef,
  floatingRef,
  offsetPx = 8,
  viewportPaddingPx = 16,
}: FloatingPopoverOptions) => {
  const [position, setPosition] = useState<FloatingPopoverState>({
    left: 0,
    top: 0,
  })
  const [isPositioned, setIsPositioned] = useState(!enabled)
  const [retryToken, setRetryToken] = useState(0)

  useLayoutEffect(() => {
    if (!enabled) {
      setIsPositioned(true)
      setRetryToken(previous => (previous === 0 ? previous : 0))
      return
    }

    if (!open) {
      setRetryToken(previous => (previous === 0 ? previous : 0))
      return
    }

    const reference = referenceRef.current
    const floating = floatingRef.current
    if (!reference || !floating) {
      if (typeof window === 'undefined') return

      const frame = window.requestAnimationFrame(() => {
        setRetryToken(previous => previous + 1)
      })

      return () => {
        window.cancelAnimationFrame(frame)
      }
    }

    let active = true
    setIsPositioned(false)

    const updatePosition = async () => {
      let nextMaxHeight: number | undefined
      let nextMaxWidth: number | undefined

      try {
        const nextPosition = await computePosition(reference, floating, {
          placement: 'bottom-start',
          strategy: 'absolute',
          platform: floatingPlatform,
          middleware: [
            offset(offsetPx),
            flip({ padding: viewportPaddingPx }),
            shift({
              padding: viewportPaddingPx,
              limiter: limitShift(),
            }),
            size({
              padding: viewportPaddingPx,
              apply({ availableHeight, availableWidth }) {
                nextMaxHeight = clamp(availableHeight)
                nextMaxWidth = clamp(availableWidth)
              },
            }),
          ],
        })

        if (!active) return

        setPosition(previous => {
          const resolved = {
            left: round(nextPosition.x),
            top: round(nextPosition.y),
            maxHeight: nextMaxHeight,
            maxWidth: nextMaxWidth,
          }

          if (
            previous.left === resolved.left
            && previous.top === resolved.top
            && previous.maxHeight === resolved.maxHeight
            && previous.maxWidth === resolved.maxWidth
          ) {
            return previous
          }

          return resolved
        })
        setIsPositioned(true)
      } catch {
        if (!active) return

        const rect = reference.getBoundingClientRect()
        setPosition({
          left: round(rect.left + window.scrollX),
          top: round(rect.bottom + window.scrollY + offsetPx),
        })
        setIsPositioned(true)
      }
    }

    void updatePosition()
    const cleanup = autoUpdate(reference, floating, updatePosition, {
      elementResize: typeof ResizeObserver === 'function',
      layoutShift: typeof IntersectionObserver === 'function',
    })

    return () => {
      active = false
      cleanup()
    }
  }, [
    enabled,
    floatingRef,
    offsetPx,
    open,
    referenceRef,
    retryToken,
    viewportPaddingPx,
  ])

  return {
    isPositioned,
    floatingStyle: enabled
      ? {
          left: position.left,
          top: position.top,
        }
      : undefined,
    panelStyle: enabled
      ? {
          maxHeight: position.maxHeight ? `${position.maxHeight}px` : undefined,
          maxWidth: position.maxWidth ? `${position.maxWidth}px` : undefined,
          overflowY: 'auto' as const,
        }
      : undefined,
  }
}

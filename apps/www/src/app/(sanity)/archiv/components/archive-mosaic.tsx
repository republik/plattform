'use client'

import { RENDER_WIDTH, UNSCALED_BELOW } from '@/app/(sanity)/archiv/lib/mosaic'
import { css } from '@republik/theme/css'
import { useCallback, useEffect, useRef, useState } from 'react'

const mosaicStyle = css({
  // Kept equal to the tiles' bottom margin so the gutters are even.
  columnGap: '4',
  columns: '1 auto',
  md: { columns: '2 auto' },
  lg: { columns: '3 auto' },
  xlg: { columns: '4 auto' },
})

/**
 * Masonry container. Each tile is laid out at RENDER_WIDTH and shrunk into its
 * column; because a transform doesn't affect layout, the outer box is given the
 * height that shrinking produced, or the column would reserve the full one.
 */
export function ArchiveMosaic({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [measured, setMeasured] = useState(false)

  const measure = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const unscaled = window.innerWidth < UNSCALED_BELOW

    for (const inner of container.querySelectorAll<HTMLElement>(
      '[data-archive-tile-inner]',
    )) {
      const tile = inner.parentElement
      if (!tile) continue

      if (unscaled) {
        inner.style.width = '100%'
        inner.style.transform = 'none'
        tile.style.height = 'auto'
        continue
      }

      // offsetWidth, not getBoundingClientRect(): the latter reports the
      // transformed width, so re-measuring while a tile is hovered would
      // fold the hover's scale into the stored one and shrink it for good.
      const scale = tile.offsetWidth / RENDER_WIDTH
      inner.style.width = `${RENDER_WIDTH}px`
      inner.style.transform = `scale(${scale})`
      tile.style.height = `${inner.scrollHeight * scale}px`
    }

    setMeasured(true)
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    measure()

    // Watching the inner boxes as well as the container means late-loading
    // images re-trigger the height calculation.
    const observer = new ResizeObserver(measure)
    observer.observe(container)
    for (const inner of container.querySelectorAll(
      '[data-archive-tile-inner]',
    )) {
      observer.observe(inner)
    }

    return () => observer.disconnect()
  }, [measure])

  return (
    <div
      ref={containerRef}
      className={mosaicStyle}
      // Tiles sit at full width until the measurement lands.
      style={{ opacity: measured ? 1 : 0 }}
    >
      {children}
    </div>
  )
}

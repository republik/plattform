'use client'

import { RENDER_WIDTH } from '@/app/(sanity)/archiv/lib/mosaic'
import { css } from '@republik/theme/css'
import { useEffect, useRef } from 'react'

// Below 640px teasers render unscaled in their own mobile styles. Above, each
// tile is laid out at RENDER_WIDTH and zoomed into its column; unlike a
// transform, zoom affects layout, so tile heights follow on their own.
const mosaicStyle = css({
  // Matches the tiles' bottom margin.
  columnGap: '4',
  columns: '1 auto',
  md: { columns: '2 auto' },
  lg: { columns: '3 auto' },
  xlg: { columns: '4 auto' },
  '@media (min-width: 640px)': {
    '&:not([data-zoomed])': { visibility: 'hidden' },
    '& [data-archive-tile-inner]': {
      width: 'var(--archive-render-width)',
      zoom: 'var(--archive-zoom)',
    },
  },
})

export function ArchiveMosaic({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const tile = container?.querySelector<HTMLElement>('[data-archive-tile]')
    if (!container || !tile) return

    // Zooming changes the container's height, so react to width changes only.
    let width = 0
    const observer = new ResizeObserver(() => {
      if (tile.offsetWidth === width) return
      width = tile.offsetWidth
      container.style.setProperty(
        '--archive-zoom',
        String(width / RENDER_WIDTH),
      )
      container.dataset.zoomed = ''
    })
    observer.observe(container)

    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      className={mosaicStyle}
      style={
        { '--archive-render-width': `${RENDER_WIDTH}px` } as React.CSSProperties
      }
    >
      {children}
    </div>
  )
}

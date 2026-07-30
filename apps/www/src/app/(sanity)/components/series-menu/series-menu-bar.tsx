'use client'

import { getSeriesLabels } from '@/app/(sanity)/components/series-labels'
import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { SERIES_MENU_QUERY_RESULT } from '@/sanity.types'
import { IconKeyboardArrowDown, IconKeyboardArrowUp } from '@republik/icons'
import { css } from '@republik/theme/css'
import { useEffect, useRef, useState } from 'react'

const barButtonStyle = css({
  display: 'block',
  width: 'full',
  padding: '5px 0',
  cursor: 'pointer',
  borderBottomWidth: 1,
  borderBottomStyle: 'solid',
  borderBottomColor: 'divider',
  background: 'pageBackground',
  textStyle: 'sans',
})

const barTitleStyle = css({
  display: 'flex',
  gap: '1.5',
  justifyContent: 'center',
  alignItems: 'center',
  width: 'full',
  minWidth: 0,
  fontSize: '15px',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  flexShrink: 1,
  md: { fontSize: '18px' },
})

const menuStyle = css({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 1,
  overflow: 'auto',
  WebkitOverflowScrolling: 'touch',
  background: 'background',
  color: 'text',
  visibility: 'hidden',
  opacity: 0,
  transition: 'opacity 0.2s ease-in-out, visibility 0s linear 0.2s',
  '&[aria-expanded=true]': {
    opacity: 1,
    visibility: 'visible',
    transition: 'opacity 0.2s ease-in-out',
  },
})

const gridStyle = css({
  gridColumn: 'breakout',
  display: 'grid',
  gridTemplateColumns: '1fr',
  md: {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  lg: {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
  columnGap: '4',
  rowGap: '12',
})

export function SeriesMenuBar({
  collection,
  currentSlug,
}: {
  collection: SERIES_MENU_QUERY_RESULT['articleCollection']
  currentSlug: string
}) {
  const [expanded, setExpanded] = useState(false)
  const barRef = useRef<HTMLButtonElement>(null)
  const [menuTop, setMenuTop] = useState(0)

  const episodes = collection.episodes ?? []
  const labels = getSeriesLabels(episodes)
  const currentIndex = episodes.findIndex(
    (e) => 'slug' in e && e.slug === currentSlug,
  )

  // position the panel right below the bar, and lock body scroll while open
  useEffect(() => {
    if (!expanded) return
    setMenuTop(barRef.current?.getBoundingClientRect().bottom ?? 0)
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [expanded])

  const Icon = expanded ? IconKeyboardArrowUp : IconKeyboardArrowDown
  const teasers = getNotExpiredTeasers(episodes)

  return (
    <>
      <button
        ref={barRef}
        type='button'
        className={barButtonStyle}
        aria-expanded={expanded}
        onClick={() => setExpanded((state) => !state)}
      >
        <span className={barTitleStyle}>
          <span>
            Folge {currentIndex + 1}: {collection.title}
          </span>
          <span className={css({ md: { display: 'none' } })}>
            <Icon size={18} />
          </span>
          <span className={css({ display: 'none', md: { display: 'inline' } })}>
            <Icon size={24} />
          </span>
        </span>
      </button>

      <div
        className={menuStyle}
        aria-expanded={expanded}
        style={{ top: menuTop }}
      >
        <div
          className={css({
            maxWidth: 'large',
            marginX: 'auto',
            paddingX: '4',
            paddingY: '8',
          })}
        >
          {collection.description && (
            <p
              className={css({
                textStyle: 'editorialLead',
                fontSize: 'xl',
                mb: '8',
              })}
            >
              {collection.description}
            </p>
          )}
          <div className={gridStyle}>
            {teasers.map((episode, index) => (
              <div
                key={episode._id}
                onClick={() => setExpanded(false)}
                data-current={index === currentIndex || undefined}
              >
                <GridTeaser
                  teaser={episode}
                  label={
                    index === currentIndex
                      ? `<span style="font-weight: 500">Sie lesen: ${labels[index]}</span>`
                      : labels[index]
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

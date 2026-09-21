'use client'

import { getNotExpiredTeasers } from '@/app/(sanity)/components/teaser/_shared/teaser-list-item'
import GridTeaser from '@/app/(sanity)/components/teaser/grid'
import { SERIES_MENU_QUERY_RESULT } from '@/sanity.types'
import * as Dialog from '@radix-ui/react-dialog'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { IconKeyboardArrowDown, IconKeyboardArrowUp } from '@republik/icons'
import { css, cx } from '@republik/theme/css'
import { editorialContent } from '@republik/theme/recipes'
import { useEffect, useRef, useState } from 'react'

const barButtonStyle = css({
  position: 'sticky',
  top: 0,
  zIndex: 2,
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

const overlayStyle = css({
  position: 'fixed',
  inset: 0,
  zIndex: 10000,
})

const menuStyle = css({
  position: 'fixed',
  left: 0,
  right: 0,
  bottom: 0,
  zIndex: 10001,
  overflow: 'auto',
  background: 'background',
  color: 'text',
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
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
  const [barHeight, setBarHeight] = useState(0)

  const episodes = collection.episodes ?? []
  const currentIndex = episodes.findIndex(
    (e) => 'slug' in e && e.slug === currentSlug,
  )

  useEffect(() => {
    const bar = barRef.current
    if (!bar) return

    const observer = new ResizeObserver(() => {
      setBarHeight(bar.getBoundingClientRect().height)
    })
    observer.observe(bar)

    return () => observer.disconnect()
  }, [])

  const Icon = expanded ? IconKeyboardArrowUp : IconKeyboardArrowDown
  const teasers = getNotExpiredTeasers(episodes)

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      <Dialog.Trigger ref={barRef} className={barButtonStyle}>
        <span className={barTitleStyle}>
          <span>
            {episodes[currentIndex].label}: {collection.title}
          </span>
          <span className={css({ md: { display: 'none' } })}>
            <Icon size={18} />
          </span>
          <span className={css({ display: 'none', md: { display: 'inline' } })}>
            <Icon size={24} />
          </span>
        </span>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className={overlayStyle} />

        <Dialog.Content
          className={menuStyle}
          style={{ top: barHeight }}
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <VisuallyHidden asChild>
            <Dialog.Title>{collection.title}</Dialog.Title>
          </VisuallyHidden>
          <div
            className={cx(
              editorialContent({ theme: 'EDITORIAL' }),
              css({ paddingY: '8' }),
            )}
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
                    isCurrentArticle={index === currentIndex}
                  />
                </div>
              ))}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

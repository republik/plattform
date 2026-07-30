'use client'

import { useTranslation } from '@/lib/withT'
import { css, cx } from '@republik/theme/css'
import { CircleCheck, CircleDashed } from 'lucide-react'
import { useRef } from 'react'
import { ACTION_ICON_SIZE, actionButtonStyle } from './action-button-style'
import { scrollToReadingPosition } from './scroll-to-reading-position'

// `actionButtonStyle` assumes something clickable; the read state only reports state.
const indicatorStyle = css({
  cursor: 'default',
  _hover: { color: 'text' },
})

export type ReadingPositionButtonProps = {
  /** Rounded percentage; undefined when no reading position is stored. */
  percent?: number
  isRead: boolean
  /** The stored position to scroll back to. */
  position?: { nodeId?: string | null; percentage?: number | null }
}

export function ReadingPositionButton({
  percent,
  isRead,
  position,
}: ReadingPositionButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const { t } = useTranslation()

  if (percent === undefined) {
    return null
  }

  // A finished article has nowhere useful to jump to, so it stays a plain
  // indicator rather than a button that scrolls to the very end.
  if (isRead) {
    const read = t('article/actionbar/progress/read')
    return (
      <span className={cx(actionButtonStyle, indicatorStyle)} title={read}>
        <CircleCheck size={ACTION_ICON_SIZE} />
        {read}
      </span>
    )
  }

  return (
    <button
      className={actionButtonStyle}
      onClick={() => {
        // The action bar renders inside the <article>, which is the element the
        // stored position is measured against.
        const container = ref.current?.closest('article')
        if (container) {
          scrollToReadingPosition({ container, ...position })
        }
      }}
      ref={ref}
      title='Zur Leseposition springen'
      type='button'
    >
      <CircleDashed size={ACTION_ICON_SIZE} />
      {percent}%
    </button>
  )
}

'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE_STEP,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '@/app/lib/font-size'
import { useFontSize } from '@/lib/fontSize'
import { IconAdd, IconRemove } from '@republik/icons'
import { css } from '@republik/theme/css'

const rowStyle = css({
  alignItems: 'center',
  display: 'flex',
  gap: '2',
  marginLeft: 'auto',
})

const stepButtonStyle = css({
  alignItems: 'center',
  borderRadius: 'sm',
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  padding: '1',
  _hover: { backgroundColor: 'hover' },
  '&:disabled': { color: 'disabled', cursor: 'default' },
})

const percentageStyle = css({
  fontVariantNumeric: 'tabular-nums',
  minWidth: '2.5rem',
  textAlign: 'center',
})

/**
 * Meant to sit at the right edge of a menu item (`marginLeft: auto` pushes it
 * there within the item's flex row). Every button stops propagation so the
 * click doesn't reach the item's own select handler — belt-and-braces
 * alongside that item's `closeOnSelect={false}`.
 */
export function FontSizeStepper() {
  const [fontSize, setFontSize] = useFontSize(DEFAULT_FONT_SIZE)
  const trackEvent = useTrackEvent()
  const percentage = `${Math.round((100 * fontSize) / DEFAULT_FONT_SIZE)}%`

  return (
    <div className={rowStyle} onClick={(event) => event.stopPropagation()}>
      <button
        type='button'
        className={stepButtonStyle}
        disabled={fontSize <= MIN_FONT_SIZE}
        onClick={() => {
          trackEvent({ action: 'fontSize:decrease', name: percentage })
          setFontSize(Math.max(MIN_FONT_SIZE, fontSize - FONT_SIZE_STEP))
        }}
        aria-label='Schrift verkleinern'
      >
        <IconRemove size={18} />
      </button>
      <span className={percentageStyle}>{percentage}</span>
      <button
        type='button'
        className={stepButtonStyle}
        disabled={fontSize >= MAX_FONT_SIZE}
        onClick={() => {
          trackEvent({ action: 'fontSize:increase', name: percentage })
          setFontSize(Math.min(MAX_FONT_SIZE, fontSize + FONT_SIZE_STEP))
        }}
        aria-label='Schrift vergrössern'
      >
        <IconAdd size={18} />
      </button>
    </div>
  )
}

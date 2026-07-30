'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import {
  DEFAULT_FONT_SIZE,
  FONT_SIZE_STEP,
  MAX_FONT_SIZE,
  MIN_FONT_SIZE,
} from '@/app/lib/font-size'
import { useFontSize } from '@/lib/fontSize'
import * as Dialog from '@radix-ui/react-dialog'
import { css } from '@republik/theme/css'
import { CircleMinus, CirclePlus, X } from 'lucide-react'
import { useEffect } from 'react'

const stepButtonStyle = css({
  alignItems: 'center',
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  padding: '3',
  _hover: { backgroundColor: 'hover' },
  '&:disabled': { color: 'disabled', cursor: 'default' },
})

export function FontSizeDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [fontSize, setFontSize] = useFontSize(DEFAULT_FONT_SIZE)
  const trackEvent = useTrackEvent()
  const percentage = `${Math.round((100 * fontSize) / DEFAULT_FONT_SIZE)}%`

  useEffect(() => {
    if (!open) return
    trackEvent({ action: 'openOverlay', name: percentage })
    return () => trackEvent({ action: 'closeOverlay', name: percentage })
    // Only the open/close transition is tracked, not every size change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            backgroundColor: 'overlay',
            display: 'grid',
            inset: 0,
            overflowY: 'auto',
            placeItems: 'center',
            position: 'fixed',
            zIndex: 99998,
            _stateOpen: { animation: 'fadeIn' },
          })}
        >
          <Dialog.Content
            aria-describedby={undefined}
            className={css({
              backgroundColor: 'background.overlay',
              boxShadow: 'md',
              color: 'text',
              margin: '8',
              maxWidth: 320,
              zIndex: 99999,
            })}
          >
            <div
              className={css({
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'text-muted',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '4',
              })}
            >
              <Dialog.Title className={css({ fontWeight: 'medium' })}>
                Schriftgrösse
              </Dialog.Title>
              <Dialog.Close
                aria-label='Schliessen'
                className={css({ cursor: 'pointer' })}
              >
                <X size={24} />
              </Dialog.Close>
            </div>

            <div className={css({ padding: '4', textAlign: 'center' })}>
              <div
                className={css({
                  alignItems: 'center',
                  display: 'flex',
                  gap: '4',
                  justifyContent: 'center',
                })}
              >
                <button
                  className={stepButtonStyle}
                  disabled={fontSize <= MIN_FONT_SIZE}
                  onClick={() =>
                    setFontSize(
                      Math.max(MIN_FONT_SIZE, fontSize - FONT_SIZE_STEP),
                    )
                  }
                  title='Schrift verkleinern'
                  type='button'
                >
                  <CircleMinus size={24} />
                </button>
                <span
                  className={css({
                    minWidth: '4rem',
                    textStyle: 'sans',
                    fontSize: 'l',
                    fontWeight: 'medium',
                  })}
                >
                  {percentage}
                </span>
                <button
                  className={stepButtonStyle}
                  disabled={fontSize >= MAX_FONT_SIZE}
                  onClick={() =>
                    setFontSize(
                      Math.min(MAX_FONT_SIZE, fontSize + FONT_SIZE_STEP),
                    )
                  }
                  title='Schrift vergrössern'
                  type='button'
                >
                  <CirclePlus size={24} />
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

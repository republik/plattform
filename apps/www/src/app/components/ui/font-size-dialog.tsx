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
import { IconAdd, IconClose, IconRemove } from '@republik/icons'
import { css } from '@republik/theme/css'
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
            // Same stacking plane as `ui/overlay.tsx`. Anything lower is covered
            // by the campaign paynote, which is fixed to the bottom at 9998.
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
              maxWidth: 375,
              width: 'full',
              zIndex: 99999,
            })}
          >
            <div
              className={css({
                alignItems: 'center',
                borderBottom: '1px solid',
                borderColor: 'divider',
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
                <IconClose size={24} />
              </Dialog.Close>
            </div>

            <div className={css({ padding: '6', textAlign: 'center' })}>
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
                  <IconRemove size={24} />
                </button>
                <span className={css({ minWidth: '4rem', textStyle: 'sans' })}>
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
                  <IconAdd size={24} />
                </button>
              </div>

              <button
                className={css({
                  cursor: 'pointer',
                  color: 'textSoft',
                  fontSize: 's',
                  marginTop: '2',
                  textDecoration: 'underline',
                })}
                onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
                type='button'
              >
                Zurücksetzen
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

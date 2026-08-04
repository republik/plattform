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
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'
import { IconAdd, IconRemove } from '@republik/icons'
import { css } from '@republik/theme/css'
import { useEffect } from 'react'

const stepButtonStyle = css({
  alignItems: 'center',
  borderRadius: 'sm',
  cursor: 'pointer',
  display: 'inline-flex',
  justifyContent: 'center',
  padding: '2',
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
            _stateClosed: { animation: 'fadeOut' },
          })}
        >
          <Dialog.Content
            aria-describedby={undefined}
            className={css({
              backgroundColor: 'background.overlay',
              boxShadow: 'md',
              color: 'text',
              // Hugs its content — the panel holds a stepper, not a form.
              margin: '4',
              padding: '4',
              textAlign: 'center',
              width: 'fit-content',
              zIndex: 99999,
            })}
          >
            {/* Radix requires a title; the panel is small enough to speak for
                itself, so it is only exposed to assistive technology. */}
            <VisuallyHidden asChild>
              <Dialog.Title>Schriftgrösse</Dialog.Title>
            </VisuallyHidden>

            <div
              className={css({
                alignItems: 'center',
                display: 'flex',
                gap: '2',
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
              <span
                className={css({
                  textStyle: 'sans',
                  fontSize: 's',
                  // Keeps the panel from twitching between 80 % and 100 %.
                  fontVariantNumeric: 'tabular-nums',
                  minWidth: '3.5rem',
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
                <IconAdd size={24} />
              </button>
            </div>

            <button
              className={css({
                textStyle: 'sans',
                cursor: 'pointer',
                color: 'textSoft',
                fontSize: 'xs',
                marginTop: '1',
                textDecoration: 'underline',
                _hover: { color: 'text' },
              })}
              onClick={() => setFontSize(DEFAULT_FONT_SIZE)}
              type='button'
            >
              Zurücksetzen
            </button>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

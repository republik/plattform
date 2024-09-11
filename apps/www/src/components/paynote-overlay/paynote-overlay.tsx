'use client'

import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { token } from '@republik/theme/tokens'
import { useState } from 'react'

import * as Dialog from '@radix-ui/react-dialog'
import { useMe } from 'lib/context/MeContext'

import { Offers } from '@app/components/paynote-overlay/paynote-components'
import { usePaynote } from '@app/components/paynote-overlay/paynote-article'
import { StructuredText } from 'react-datocms'

export function PaynoteOverlay() {
  const [expanded, setExpanded] = useState<boolean>(true)
  const { hasActiveMembership, meLoading } = useMe()
  const paynote = usePaynote()

  if (meLoading || hasActiveMembership || !paynote) {
    return null
  }

  return (
    <Dialog.Root open={expanded} onOpenChange={setExpanded}>
      {/* <Dialog.Trigger asChild>
        <button
          className={css({
            position: 'absolute',
            top: '4',
            right: '4',
          })}
        >
          {!expanded ? (
            <IconExpandLess size={24} />
          ) : (
            <IconExpandMore size={24} />
          )}
        </button>
      </Dialog.Trigger> */}
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            backgroundColor: 'overlay',
            position: 'fixed',
            inset: 0,
            display: 'grid',
            placeItems: 'end stretch',
            overflowY: 'auto',
            zIndex: 9999,
          })}
        >
          <Dialog.Content
            onEscapeKeyDown={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            className={css({
              background: 'pageBackground',
              p: '8',
              boxShadow: 'sm',
              mt: '25dvh',
            })}
            style={{
              backgroundColor: !expanded
                ? token('colors.text')
                : token('colors.text.inverted'),
              color: !expanded
                ? token('colors.text.inverted')
                : token('colors.text'),
            }}
            onClick={() => {
              if (!expanded) {
                setExpanded(true)
              }
            }}
          >
            <div
              className={css({
                margin: '0 auto',
                maxW: '34rem',
                textStyle: 'serifRegular',
                lineHeight: 1.5,
                fontSize: 'l',
                display: 'flex',
                flexDir: 'column',
                gap: '6',
              })}
            >
              <h2
                className={css({
                  textStyle: { base: 'h3Serif', sm: 'h2Serif' },
                  lineHeight: 1.5,
                })}
              >
                <span
                  className={css({
                    boxDecorationBreak: 'clone',
                    px: '1.5',
                    backgroundColor: '#FDE047',
                  })}
                >
                  {paynote.title}
                </span>
              </h2>

              <div
                className={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4',
                  pb: '6',
                })}
              >
                <StructuredText data={paynote.message.value}></StructuredText>
              </div>

              <Offers />

              <Dialog.Close
                className={css({
                  textStyle: 'sansSerifRegular',
                  textDecoration: 'underline',
                  fontSize: 'base',
                  cursor: 'pointer',
                  mx: 'auto',
                })}
              >
                Jetzt nicht
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

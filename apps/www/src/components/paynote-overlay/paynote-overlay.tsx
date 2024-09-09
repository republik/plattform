'use client'

import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { token } from '@republik/theme/tokens'
import { useState } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'
import { useMe } from 'lib/context/MeContext'

import { Offers } from '@app/components/paynote-overlay/paynote-components'

export function PaynoteOverlay() {
  const [expanded, setExpanded] = useState<boolean>(true)
  const { hasActiveMembership, meLoading } = useMe()

  if (meLoading || hasActiveMembership) {
    return null
  }

  return (
    <Collapsible.Root
      open={expanded}
      onOpenChange={setExpanded}
      className={css({
        position: 'fixed',
        zIndex: 9999,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'pageBackground',
        p: '8',
        boxShadow: 'sm',
        // transition: 'all 0.3s ease-in-out',
      })}
      style={{
        backgroundColor: !expanded
          ? token('colors.text')
          : token('colors.text.inverted'),
        color: !expanded ? token('colors.text.inverted') : token('colors.text'),
      }}
      onClick={() => {
        if (!expanded) {
          setExpanded(true)
        }
      }}
    >
      <Collapsible.Trigger asChild>
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
      </Collapsible.Trigger>

      <div
        className={css({
          margin: '0 auto',
          maxW: '30rem',
          textStyle: 'serifRegular',
        })}
      >
        <h2
          className={css({
            textStyle: { base: 'h3Serif', sm: 'h2Serif' },
            lineHeight: 1.5,
            textAlign: 'center',
          })}
        >
          <span
            className={css({
              boxDecorationBreak: 'clone',
              px: '1.5',
            })}
            style={{
              backgroundColor: expanded ? '#FDE047' : null,
              color: expanded ? token('colors.text.black') : null,
            }}
          >
            Unterstützen Sie unabhängigen Journalismus
          </span>
        </h2>

        <Collapsible.Content>
          <div className={css({ mt: '4' })}>
            <Offers />
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

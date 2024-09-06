'use client'

import { IconExpandLess, IconExpandMore } from '@republik/icons'
import { css } from '@republik/theme/css'
import { token } from '@republik/theme/tokens'
import { useState } from 'react'

import * as Collapsible from '@radix-ui/react-collapsible'

export function PaynoteOverlay() {
  const [expanded, setExpanded] = useState<boolean>(true)

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
          maxW: 'maxContentWidth',
          textStyle: 'serifRegular',
        })}
      >
        <h2 className={css({ textStyle: 'h3Serif' })}>
          Unterstützen Sie unabhängigen Journalismus
        </h2>

        <Collapsible.Content>
          <div className={css({ mt: '4' })}>
            Unterstützen Sie unabhängigen Journalismus, Unterstützen Sie
            unabhängigen Journalismus, Unterstützen Sie unabhängigen
            Journalismus, Unterstützen Sie unabhängigen Journalismus,
            Unterstützen Sie unabhängigen Journalismus, Unterstützen Sie
            unabhängigen Journalismus, Unterstützen Sie unabhängigen
            Journalismus, Unterstützen Sie unabhängigen Journalismus,
            Unterstützen Sie unabhängigen Journalismus, Unterstützen Sie
            unabhängigen Journalismus
          </div>
        </Collapsible.Content>
      </div>
    </Collapsible.Root>
  )
}

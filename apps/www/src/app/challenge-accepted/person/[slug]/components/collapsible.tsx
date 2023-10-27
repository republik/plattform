'use client'

import { css } from '@app/styled-system/css'
import { vstack } from '@app/styled-system/patterns'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { useState } from 'react'

export const Collapsible = ({ shownItems, collapsedItems }) => {
  const [open, setOpen] = useState(false)

  return (
    <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
      <div
        className={css({
          borderColor: 'contrast',
          borderStyle: 'solid',
          borderTopWidth: 1,
          borderBottomWidth: 1,
        })}
      >
        <div className={vstack({ alignItems: 'start' })}>{shownItems}</div>
        <RadixCollapsible.Content
          className={vstack({
            alignItems: 'start',
            overflow: 'hidden',
            animationTimingFunction: 'ease-out',
            animationDuration: '300ms',
            '&[data-state="open"]': {
              animationName: 'radixCollapsibleSlideDown',
            },
            '&[data-state="closed"]:not([hidden])': {
              animationName: 'radixCollapsibleSlideUp',
            },
          })}
        >
          {collapsedItems}
        </RadixCollapsible.Content>
      </div>
      <RadixCollapsible.Trigger asChild>
        <button
          className={css({
            color: 'contrast',
            cursor: 'pointer',
            textAlign: 'center',
            width: 'full',
            mt: '4',
          })}
        >
          {open ? 'Weniger zeigen' : 'Alle zeigen'}
        </button>
      </RadixCollapsible.Trigger>
    </RadixCollapsible.Root>
  )
}

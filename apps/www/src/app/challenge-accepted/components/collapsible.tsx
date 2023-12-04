'use client'

import { css } from '@app/styled-system/css'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { useState } from 'react'

export const Collapsible = ({ shownItems, collapsedItems }) => {
  const [open, setOpen] = useState(false)

  return (
    <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
      <div data-collapsible>
        <div data-collapsible-shown-items>{shownItems}</div>
        <RadixCollapsible.Content
          data-collapsible-collapsed-items
          className={css({
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
        <button data-collapsible-trigger>
          {open ? 'Weniger zeigen' : 'Alle zeigen'}
        </button>
      </RadixCollapsible.Trigger>
    </RadixCollapsible.Root>
  )
}

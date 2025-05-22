'use client'

import { ReactNode, useState } from 'react'

import * as RadixCollapsible from '@radix-ui/react-collapsible'

import { css } from '@republik/theme/css'
import { IconExpandMore, IconExpandLess } from '@republik/icons'

export const Collapsible = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => {
  const [open, setOpen] = useState(false)

  return (
    <RadixCollapsible.Root open={open} onOpenChange={setOpen}>
      <RadixCollapsible.Trigger asChild>
        <button
          className={css({
            display: 'flex',
            width: 'full',
            cursor: 'pointer',
            alignItems: 'center',
          })}
        >
          {title}
          <span
            className={css({ marginLeft: 'auto', display: 'inline-block' })}
          >
            {open ? <IconExpandLess size='24' /> : <IconExpandMore size='24' />}
          </span>
        </button>
      </RadixCollapsible.Trigger>
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
        {children}
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  )
}

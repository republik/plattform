'use client'

import { shortenLink } from '@/app/(sanity)/components/portable-text/helpers/shorten-link'
import { InlinePortableText } from '@/app/(sanity)/components/portable-text/render'
import type { ExpandableLink as ExpandableLinkSchemaType } from '@/sanity.types'
import * as HoverCard from '@radix-ui/react-hover-card'
import * as Popover from '@radix-ui/react-popover'
import { IconLink } from '@republik/icons'
import { css } from '@republik/theme/css'
import Link from 'next/link'
import { type ComponentPropsWithoutRef, type ReactNode, useState } from 'react'

const OPEN_DELAY = 300

const hoverOnlyStyle = css({
  display: 'none',
  _canHover: { display: 'inline' },
})

const touchOnlyStyle = css({
  _canHover: { display: 'none' },
})

const triggerStyle = css({
  cursor: 'pointer',
  textDecorationLine: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationThickness: '2px',
  textDecorationColor: 'textSoft',
  textUnderlineOffset: '3px',
})

const cardStyle = css({
  maxWidth: 'min(500px, calc(100vw - 2 * token(spacing.4)))',
  p: '4',
  textAlign: 'left',
  backgroundColor: 'background.overlay',
  boxShadow: 'md',
  color: 'text',
  zIndex: 10000,
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
  _print: { display: 'none' },
})

const descriptionStyle = css({
  textStyle: 'sans',
  fontSize: 'base',
  lineHeight: '1.3',
  mb: '2',
})

const cardLinkStyle = css({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '2',
  textStyle: 'sans',
  fontSize: 'base',
  color: 'textSoft',
  textDecoration: 'underline',
  _hover: { color: 'text' },
})

const cardLinkIconStyle = css({ flexShrink: 0, mt: 'px' })

const cardLinkLabelStyle = css({
  lineClamp: 2,
  wordBreak: 'break-word',
})

function Anchor({
  href,
  isInternal,
  children,
  ...props
}: {
  href: string
  isInternal: boolean
  children: ReactNode
} & ComponentPropsWithoutRef<'a'>) {
  if (isInternal) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <a href={href} target='_blank' rel='noreferrer' {...props}>
      {children}
    </a>
  )
}

export type ExpandableLinkCardProps = {
  href: string
  isInternal: boolean
  description?: ExpandableLinkSchemaType['content']
  /** What the link inside the card reads as. Defaults to the shortened URL. */
  label?: string
  children: ReactNode
}

export function ExpandableLinkCard({
  href,
  isInternal,
  description,
  label,
  children,
}: ExpandableLinkCardProps) {
  const [open, setOpen] = useState(false)

  const card = (
    <>
      {description && (
        <div className={descriptionStyle}>
          <InlinePortableText value={description} />
        </div>
      )}
      <Anchor href={href} isInternal={isInternal} className={cardLinkStyle}>
        <IconLink size={20} className={cardLinkIconStyle} />
        <span className={cardLinkLabelStyle}>
          {label ??
            shortenLink(href, isInternal ? window.location.origin : undefined)}
        </span>
      </Anchor>
    </>
  )

  const contentProps = {
    side: 'bottom',
    align: 'center',
    sideOffset: 8,
    collisionPadding: 16,
    className: cardStyle,
  } as const

  return (
    <>
      <span className={hoverOnlyStyle}>
        <HoverCard.Root openDelay={OPEN_DELAY} closeDelay={OPEN_DELAY}>
          <HoverCard.Trigger asChild>
            <Anchor
              href={href}
              isInternal={isInternal}
              className={triggerStyle}
            >
              {children}
            </Anchor>
          </HoverCard.Trigger>
          <HoverCard.Portal>
            <HoverCard.Content {...contentProps}>{card}</HoverCard.Content>
          </HoverCard.Portal>
        </HoverCard.Root>
      </span>

      <span className={touchOnlyStyle}>
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <Anchor
              href={href}
              isInternal={isInternal}
              className={triggerStyle}
              onClick={(event) => {
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.button === 1
                ) {
                  return
                }
                event.preventDefault()
                setOpen((wasOpen) => !wasOpen)
              }}
            >
              {children}
            </Anchor>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content {...contentProps}>{card}</Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </span>
    </>
  )
}

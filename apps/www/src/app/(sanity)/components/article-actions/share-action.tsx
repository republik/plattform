'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import type * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import copyToClipboard from 'clipboard-copy'
import { Link, Share as ShareIcon } from 'lucide-react'
import { useState, type Ref } from 'react'
import { ACTION_ICON_SIZE, actionLabelStyle, actionStyle } from './action-style'
import { MENU_SIDE_OFFSET } from './menu-style'
import { getShareTargets } from './share-targets'

export type ShareActionProps = {
  title: string
  path: string
  /** Where the menu sits relative to the trigger. */
  align?: DropdownMenu.DropdownMenuContentProps['align']
  /**
   * Shifts the menu sideways, for anchoring it to something other than the
   * trigger itself. Applied as a transform rather than Radix's `alignOffset`,
   * which floating-ui ignores for the unaligned `center` placement.
   */
  menuOffsetX?: number
  /**
   * Gap from the trigger. Raise it when the trigger sits inside a padded
   * container that the menu should clear, rather than just the button.
   */
  menuSideOffset?: number
  triggerRef?: Ref<HTMLButtonElement>
}

export function ShareAction({
  title,
  path,
  align = 'end',
  menuOffsetX = 0,
  menuSideOffset = MENU_SIDE_OFFSET,
  triggerRef,
}: ShareActionProps) {
  const url = new URL(path, PUBLIC_BASE_URL).toString()
  const emailSubject = `Republik: ${title}`
  const { isNativeApp } = usePlatformInformation()
  const postMessage = usePostMessage()
  const trackEvent = useTrackEvent()
  const [linkCopied, setLinkCopied] = useState(false)

  // The app has its own native share sheet — no picker to render, just hand
  // the URL over.
  if (isNativeApp) {
    return (
      <button
        ref={triggerRef}
        className={actionStyle}
        onClick={() => {
          trackEvent({ action: 'shareNative', name: url })
          postMessage({
            type: 'share',
            payload: { title, url, subject: emailSubject, dialogTitle: 'Teilen' },
          })
        }}
        type='button'
      >
        <ShareIcon size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Teilen</span>
      </button>
    )
  }

  const shareLinks = getShareTargets(url, emailSubject)

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger ref={triggerRef} aria-label='Teilen' className={actionStyle}>
        <ShareIcon size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Teilen</span>
      </Menu.Trigger>
      <Menu.Content
        align={align}
        sideOffset={menuSideOffset}
        collisionPadding={16}
        title='Teilen'
        style={
          menuOffsetX
            ? { transform: `translateX(${menuOffsetX}px)` }
            : undefined
        }
      >
        {shareLinks.map(({ name, href, icon: Icon, label }) => (
          <Menu.Item asChild key={name}>
            <a
              className={menuItemStyle}
              href={href}
              onClick={() =>
                trackEvent({ action: `shareButton:${name}`, name: url })
              }
              rel='noreferrer'
              target='_blank'
            >
              <Icon size={ACTION_ICON_SIZE} />
              {label}
            </a>
          </Menu.Item>
        ))}
        <Menu.Item asChild>
          <a
            className={menuItemStyle}
            href={url}
            onClick={(e) => {
              e.preventDefault()
              trackEvent({ action: 'shareButton:copyLink', name: url })
              copyToClipboard(url).then(() => setLinkCopied(true))
            }}
          >
            <Link size={ACTION_ICON_SIZE} />
            {linkCopied ? 'Link kopiert' : 'Link kopieren'}
          </a>
        </Menu.Item>
      </Menu.Content>
    </Menu.Root>
  )
}

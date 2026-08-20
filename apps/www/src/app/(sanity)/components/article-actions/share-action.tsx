'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { IconLogoTelegram, IconLogoThreema, IconLogoWhatsApp } from '@republik/icons'
import copyToClipboard from 'clipboard-copy'
import { Facebook, Link, Mail, Share as ShareIcon } from 'lucide-react'
import { useState, type Ref } from 'react'
import { ACTION_ICON_SIZE, actionLabelStyle, actionStyle } from './action-style'
import {
  MENU_SIDE_OFFSET,
  menuItemStyle,
  menuPanelStyle,
} from './menu-style'

export function ShareAction({
  title,
  path,
  align = 'end',
  menuOffsetX = 0,
  menuSideOffset = MENU_SIDE_OFFSET,
  triggerRef,
}: {
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
}) {
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

  const shareLinks = [
    {
      name: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      icon: Facebook,
      label: 'Facebook',
    },
    {
      name: 'whatsapp',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
      icon: IconLogoWhatsApp,
      label: 'WhatsApp',
    },
    {
      name: 'threema',
      href: `https://threema.id/compose?text=${encodeURIComponent(url)}`,
      icon: IconLogoThreema,
      label: 'Threema',
    },
    {
      name: 'telegram',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}`,
      icon: IconLogoTelegram,
      label: 'Telegram',
    },
    {
      name: 'mail',
      href: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(url)}`,
      icon: Mail,
      label: 'E-Mail',
    },
  ]

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger
        ref={triggerRef}
        aria-label='Teilen'
        className={actionStyle}
      >
        <ShareIcon size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>Teilen</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={menuSideOffset}
          collisionPadding={16}
          className={menuPanelStyle}
          style={
            menuOffsetX
              ? { transform: `translateX(${menuOffsetX}px)` }
              : undefined
          }
        >
          {shareLinks.map(({ name, href, icon: Icon, label }) => (
            <DropdownMenu.Item asChild key={name}>
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
            </DropdownMenu.Item>
          ))}
          <DropdownMenu.Item asChild>
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
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

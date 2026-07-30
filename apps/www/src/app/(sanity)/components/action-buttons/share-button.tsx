'use client'

import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { IconLogoTelegram, IconLogoThreema, IconLogoWhatsApp } from '@republik/icons'
import { css } from '@republik/theme/css'
import copyToClipboard from 'clipboard-copy'
import { Facebook, Link, Mail, Share as ShareIcon } from 'lucide-react'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionButtonStyle } from './action-button-style'

const menuPanelStyle = css({
  backgroundColor: 'background.overlay',
  boxShadow: 'md',
  color: 'text',
  minWidth: '12rem',
  paddingY: '2',
  _stateOpen: { animation: 'fadeIn' },
  _stateClosed: { animation: 'fadeOut' },
})

const menuItemStyle = css({
  alignItems: 'center',
  color: 'text',
  cursor: 'pointer',
  display: 'flex',
  gap: '3',
  fontSize: 's',
  fontWeight: 'regular',
  outline: 'none',
  paddingX: '5',
  paddingY: '3',
  textAlign: 'left',
  textDecoration: 'none',
  textStyle: 'sans',
  width: 'full',
  '&[data-highlighted], &:hover': {
    backgroundColor: 'hover',
  },
  '& > svg': {
    flexShrink: 0,
  },
})

export function ShareButton({ title, path }: { title: string; path: string }) {
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
        className={actionButtonStyle}
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
        Teilen
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
      <DropdownMenu.Trigger aria-label='Teilen' className={actionButtonStyle}>
        <ShareIcon size={ACTION_ICON_SIZE} />
        Teilen
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align='end'
          sideOffset={8}
          collisionPadding={16}
          className={menuPanelStyle}
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

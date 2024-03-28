'use client'
import { css } from '@republik/theme/css'
import * as Dialog from '@radix-ui/react-dialog'
import { Root as VisuallyHidden } from '@radix-ui/react-visually-hidden'
import {
  IconClose,
  IconLink,
  IconLogoFacebook,
  IconLogoTelegram,
  IconLogoThreema,
  IconLogoWhatsApp,
  IconMail,
} from '@republik/icons'
import { ComponentPropsWithoutRef, useState } from 'react'
import { ShareProps } from './types'
import copyToClipboard from 'clipboard-copy'
import { useTrackEvent } from '@app/lib/matomo/event-tracking'

function ShareButton({
  icon: Icon,
  label,
  href,
  name,
  onClick,
}: {
  icon: React.ComponentType<ComponentPropsWithoutRef<typeof IconLogoFacebook>>
  label: string
  href?: string
  name: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}) {
  const trackEvent = useTrackEvent()
  return (
    <a
      className={css({
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        flex: '0 1 auto',
        cursor: 'pointer',
        margin: '4',
        gap: '2',
        color: 'text',
        textDecoration: 'none',
      })}
      target='_blank'
      href={href}
      onClick={(e) => {
        trackEvent({ action: `shareButton:${name}`, name: href })
        onClick?.(e)
      }}
      rel='noreferrer'
    >
      <Icon size={24} />
      <span>{label}</span>
    </a>
  )
}

export function ShareOverlay({
  triggerLabel,
  title,
  url,
  emailSubject,
  emailBody,
  emailAttachURL = true,
}: {
  triggerLabel: React.ReactNode
  emailBody?: string
  emailAttachURL?: boolean
} & ShareProps) {
  const [linkCopied, setLinkCopied] = useState(false)

  const shareOptions = [
    {
      name: 'facebook',
      target: '_blank',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      icon: IconLogoFacebook,
      title: 'Auf Facebook teilen',
      label: 'Facebook',
    },
    {
      name: 'whatsapp',
      target: '_blank',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
      icon: IconLogoWhatsApp,
      title: 'Auf WhatsApp teilen',
      label: 'WhatsApp',
    },
    {
      name: 'threema',
      target: '_blank',
      href: `https://threema.id/compose?text=${encodeURIComponent(url)}`,
      icon: IconLogoThreema,
      title: 'Auf Threema teilen',
      label: 'Threema',
    },
    {
      name: 'telegram',
      target: '_blank',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}`,
      icon: IconLogoTelegram,
      title: 'Auf Telegram teilen',
      label: 'Telegram',
    },
    {
      name: 'mail',
      href: `mailto:?subject=${encodeURIComponent(
        emailSubject,
      )}&body=${encodeURIComponent(url)}`,
      icon: IconMail,
      title: 'Per E-Mail verschicken',
      label: 'E-Mail',
    },
    {
      name: 'copyLink',
      href: url,
      icon: IconLink,
      title: 'Link kopieren',
      label: linkCopied ? 'Link kopiert' : 'Link kopieren',
      onClick: (e) => {
        e.preventDefault()
        copyToClipboard(url).then(() => setLinkCopied(true))
      },
    },
  ].filter(Boolean)

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className={css({ textAlign: 'left' })}>{triggerLabel}</button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={css({
            position: 'fixed',
            inset: '0',
            display: 'grid',
            placeItems: 'center',
            overflowY: 'auto',
            background: 'overlay',
          })}
        >
          <Dialog.Content
            className={css({
              m: '8',
              position: 'relative',
              background: 'background',
              w: 'full',
              maxW: 400,
            })}
          >
            <VisuallyHidden>
              <Dialog.Description></Dialog.Description>
            </VisuallyHidden>
            <div
              className={css({
                padding: '4',
                position: 'relative',
                borderBottom: '1px solid',
                borderColor: 'divider',
              })}
            >
              <Dialog.Title
                className={css({
                  fontWeight: 'medium',
                })}
              >
                Teilen
              </Dialog.Title>
              <Dialog.Close
                className={css({ position: 'absolute', top: '4', right: '4' })}
              >
                <IconClose size={24} />
              </Dialog.Close>
            </div>
            <div
              className={css({
                p: '6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'wrap',
              })}
            >
              {shareOptions.map((shareOption) => (
                <ShareButton key={shareOption.name} {...shareOption} />
              ))}
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

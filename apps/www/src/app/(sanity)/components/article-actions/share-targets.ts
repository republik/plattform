import {
  IconLogoTelegram,
  IconLogoThreema,
  IconLogoWhatsApp,
} from '@republik/icons'
import { Facebook, Mail } from 'lucide-react'
import type { ComponentType } from 'react'

export type ShareTarget = {
  /** Also the suffix of the tracked event name. */
  name: string
  href: string
  icon: ComponentType<{ size?: number }>
  label: string
}

/**
 * Where an article can be sent. Used by the share menu with the article's own
 * URL, and by the gift menu with a `?gift=` one.
 */
export function getShareTargets(
  url: string,
  emailSubject: string,
): ShareTarget[] {
  const encodedUrl = encodeURIComponent(url)
  return [
    {
      name: 'facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      icon: Facebook,
      label: 'Facebook',
    },
    {
      name: 'whatsapp',
      href: `https://api.whatsapp.com/send?text=${encodedUrl}`,
      icon: IconLogoWhatsApp,
      label: 'WhatsApp',
    },
    {
      name: 'threema',
      href: `https://threema.id/compose?text=${encodedUrl}`,
      icon: IconLogoThreema,
      label: 'Threema',
    },
    {
      name: 'telegram',
      href: `https://t.me/share/url?url=${encodedUrl}`,
      icon: IconLogoTelegram,
      label: 'Telegram',
    },
    {
      name: 'mail',
      href: `mailto:?subject=${encodeURIComponent(
        emailSubject,
      )}&body=${encodedUrl}`,
      icon: Mail,
      label: 'E-Mail',
    },
  ]
}

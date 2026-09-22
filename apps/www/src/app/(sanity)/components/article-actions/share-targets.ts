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
 * The places an article can be handed to someone else. Shared by the plain
 * share menu and the gift menu, which pass the same list a different URL —
 * the gift one carries a `?gift=` token that unlocks the article for whoever
 * follows it.
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

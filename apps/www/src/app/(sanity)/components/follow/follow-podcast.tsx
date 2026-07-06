'use client'

import { trackEvent } from '@/app/lib/analytics/event-tracking'

import { useUserAgent } from '@/lib/context/UserAgentContext'

import { useTranslation } from '@/lib/withT'
import { Podcast } from '@/sanity.types'
import {
  IconLogoApple,
  IconOpenInNew,
  IconRssFeed,
  IconSpotify,
} from '@republik/icons'
import { css } from '@republik/theme/css'
import Link from 'next/link'

export default function FollowPodcast({
  podcast,
}: {
  podcast: Pick<Podcast, 'podigeeSlug' | 'appleUrl' | 'spotifyUrl'>
}) {
  const { userAgent, isAndroid, isIOS } = useUserAgent()
  const { t } = useTranslation()

  const { podigeeSlug, appleUrl, spotifyUrl } = podcast

  if (!podigeeSlug) {
    return null
  }

  const macOS = userAgent && userAgent.match(/Mac OS X ([0-9_]+)/)
  const macOSVersion = macOS ? parseFloat(macOS[1].replace(/_/g, '.')) : null

  const plattformWithApp = isIOS
    ? 'ios'
    : macOSVersion && macOSVersion > 10.15
    ? 'mac'
    : isAndroid
    ? 'android'
    : null

  const shareOptions = [
    plattformWithApp && {
      href:
        plattformWithApp === 'android'
          ? `pcast:${podigeeSlug}.podigee.io/feed/mp3`
          : `podcast://${podigeeSlug}.podigee.io/feed/aac`,
      target: undefined,
      Icon: IconOpenInNew,
      label: t('PodcastButtons/app'),
    },
    spotifyUrl && {
      href: spotifyUrl,
      target: '_blank',
      Icon: IconSpotify,
      label: t('PodcastButtons/spotify'),
    },
    appleUrl &&
      !isAndroid && {
        href: appleUrl,
        target: '_blank',
        Icon: IconLogoApple,
        label: t('PodcastButtons/apple'),
      },
    {
      href: `https://${podigeeSlug}.podigee.io/feed/mp3`,
      target: '_blank',
      Icon: IconRssFeed,
      label: t('PodcastButtons/rss'),
    },
  ].filter(Boolean)

  return (
    <div
      className={css({
        display: 'flex',
        gap: '8',
      })}
    >
      {shareOptions.map(({ label, Icon, href, target }) => (
        <Link
          key={label}
          href={href}
          target={target}
          title={label}
          aria-label={label}
          className={css({
            display: 'flex',
            gap: '2',
            fontWeight: 'medium',
          })}
          onClick={() => {
            trackEvent([
              'PodcastButtons',
              [plattformWithApp, label].filter(Boolean).join(' '),
              podigeeSlug,
            ])
          }}
        >
          <Icon size={24} />
          <span>{label}</span>
        </Link>
      ))}
    </div>
  )
}

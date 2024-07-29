import { useState, useEffect } from 'react'
import copyToClipboard from 'clipboard-copy'
import { css } from 'glamor'
import { IconButton, shouldIgnoreClick } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { trackEvent } from '@app/lib/analytics/event-tracking'

import { useUserAgent } from '../../lib/context/UserAgentContext'
import {
  IconLink,
  IconLogoApple,
  IconLogoGoogle,
  IconOpenInNew,
  IconPlayCircleOutline,
  IconRssFeed,
  IconSpotify,
} from '@republik/icons'

const styles = {
  buttonGroup: css({
    display: 'flex',
    flexWrap: 'wrap',
    '& > a': {
      flex: 'auto',
      marginTop: 15,
      marginBottom: 15,
      flexGrow: 0,
    },
    '@media print': {
      display: 'none',
    },
  }),
  buttonGroupLeft: css({
    justifyContent: 'flex-start',
  }),
  buttonGroupCenter: css({
    justifyContent: 'center',
  }),
}

const PodcastButtons = ({
  t,
  podigeeSlug,
  appleUrl,
  googleUrl,
  spotifyUrl,
  eventCategory = 'PodcastButtons',
  audioSource,
  onAudioClick,
  center,
}) => {
  const [copyLinkSuffix, setLinkCopySuffix] = useState()
  const { userAgent, isAndroid, isIOS } = useUserAgent()

  useEffect(() => {
    if (copyLinkSuffix === 'success') {
      const timeout = setTimeout(() => {
        setLinkCopySuffix()
      }, 5 * 1000)
      return () => clearTimeout(timeout)
    }
  }, [copyLinkSuffix])

  if (!podigeeSlug) {
    return null
  }

  const mainFeed = `https://${podigeeSlug}.podigee.io/feed/mp3`

  const macOS = userAgent && userAgent.match(/Mac OS X ([0-9_]+)/)
  const macOSVersion = macOS && parseFloat(macOS[1].replace(/_/g, '.'))

  const plattformWithApp = isIOS
    ? 'ios'
    : macOSVersion > 10.15
    ? 'mac'
    : isAndroid
    ? 'android'
    : null

  const canPlay = !!(audioSource && onAudioClick)

  const copyMinWidth = 105
  const shareOptions = [
    canPlay && {
      animate: true,
      href: audioSource.mp3,
      icon: IconPlayCircleOutline,
      title: t('PodcastButtons/play'),
      label: t('PodcastButtons/play'),
      onClick: (e) => {
        if (shouldIgnoreClick(e)) {
          return
        }
        e.preventDefault()
        onAudioClick()
      },
    },
    plattformWithApp && {
      href:
        plattformWithApp === 'android' || plattformWithApp === 'chrome'
          ? `pcast:${podigeeSlug}.podigee.io/feed/mp3`
          : `podcast://${podigeeSlug}.podigee.io/feed/aac`,
      icon: IconOpenInNew,
      label: t('PodcastButtons/app'),
    },
    spotifyUrl && {
      href: spotifyUrl,
      target: '_blank',
      icon: IconSpotify,
      label: t('PodcastButtons/spotify'),
    },
    appleUrl &&
      !isAndroid && {
        href: appleUrl,
        target: '_blank',
        icon: IconLogoApple,
        label: t('PodcastButtons/apple'),
      },
    googleUrl &&
      !isIOS && {
        href: googleUrl,
        target: '_blank',
        icon: IconLogoGoogle,
        label: t('PodcastButtons/google'),
      },
    {
      href: `https://${podigeeSlug}.podigee.io/feed/mp3`,
      target: '_blank',
      icon: IconRssFeed,
      label: t('PodcastButtons/rss'),
    },
    {
      href: mainFeed,
      icon: IconLink,
      title: t('PodcastButtons/copy'),
      label: t(
        `PodcastButtons/copy${copyLinkSuffix ? `/${copyLinkSuffix}` : ''}`,
      ),
      onClick: (e) => {
        e.preventDefault()
        copyToClipboard(mainFeed)
          .then(() => setLinkCopySuffix('success'))
          .catch(() => setLinkCopySuffix('error'))
      },
      style: {
        minWidth: copyMinWidth,
      },
    },
  ].filter(Boolean)

  return (
    <div
      {...styles.buttonGroup}
      {...(center ? styles.buttonGroupCenter : styles.buttonGroupLeft)}
    >
      {shareOptions.map((props, i) => (
        <IconButton
          key={i}
          Icon={props.icon}
          label={props.label}
          labelShort={props.label}
          {...props}
          onClick={(e) => {
            trackEvent([
              eventCategory,
              [plattformWithApp, props.icon].filter(Boolean).join(' '),
              podigeeSlug,
            ])
            if (props.onClick) {
              return props.onClick(e)
            }
          }}
        />
      ))}
    </div>
  )
}

export default withT(PodcastButtons)

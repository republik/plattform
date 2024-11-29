import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { IconButton } from '@project-r/styleguide'

import withT from '../../lib/withT'
import { trackEvent } from '@app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@app/lib/hooks/usePlatformInformation'

import copyToClipboard from 'clipboard-copy'
import {
  IconLink,
  IconLogoFacebook,
  IconLogoBluesky,
  IconLogoWhatsApp,
  IconMail,
  IconLogoTelegram,
  IconLogoThreema,
} from '@republik/icons'

const ShareButtons = ({
  t,
  url,
  title,
  emailSubject,
  emailBody,
  emailAttachUrl,
  eventCategory = 'ShareButtons',
  fill,
  onClose,
  grid,
}) => {
  const [copyLinkSuffix, setLinkCopySuffix] = useState()
  const { isAndroid, isIOS, isNativeApp } = usePlatformInformation()

  useEffect(() => {
    if (copyLinkSuffix === 'success') {
      const timeout = setTimeout(() => {
        setLinkCopySuffix()
      }, 5 * 1000)
      return () => clearTimeout(timeout)
    }
  }, [copyLinkSuffix])

  const emailAttache = emailAttachUrl ? `\n\n${url}` : ''

  const shareOptions = [
    {
      name: 'facebook',
      target: '_blank',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      icon: IconLogoFacebook,
      title: t(''),
      label: t('article/actionbar/facebook/label'),
    },
    {
      name: 'bluesky',
      target: '_blank',
      href: `https://bsky.app/intent/compose?text=${encodeURIComponent(url)}`,
      icon: IconLogoBluesky,
      title: t('article/actionbar/bluesky/title'),
      label: t('article/actionbar/bluesky/label'),
    },
    {
      name: 'whatsapp',
      target: '_blank',
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`,
      icon: IconLogoWhatsApp,
      title: t('article/actionbar/whatsapp/title'),
      label: t('article/actionbar/whatsapp/label'),
    },
    {
      name: 'threema',
      target: '_blank',
      href: `https://threema.id/compose?text=${encodeURIComponent(url)}`,
      icon: IconLogoThreema,
      title: t('article/actionbar/threema/title'),
      label: t('article/actionbar/threema/label'),
    },
    {
      name: 'telegram',
      target: '_blank',
      href: `https://t.me/share/url?url=${encodeURIComponent(url)}`,
      icon: IconLogoTelegram,
      title: t('article/actionbar/telegram/title'),
      label: t('article/actionbar/telegram/label'),
    },
    {
      name: 'mail',
      href: `mailto:?subject=${encodeURIComponent(
        emailSubject,
      )}&body=${encodeURIComponent(emailBody + emailAttache)}`,
      icon: IconMail,
      title: t('article/actionbar/email/title'),
      label: t('article/actionbar/email/label'),
    },
    {
      name: 'copyLink',
      href: url,
      icon: IconLink,
      title: t('article/actionbar/link/title'),
      label: (
        <span style={{ display: 'inline-block', minWidth: 88 }}>
          {t(
            `article/actionbar/link/label${
              copyLinkSuffix ? `/${copyLinkSuffix}` : ''
            }`,
          )}
        </span>
      ),
      onClick: (e) => {
        e.preventDefault()
        copyToClipboard(url)
          .then(() => setLinkCopySuffix('success'))
          .catch(() => setLinkCopySuffix('error'))
      },
    },
  ].filter(Boolean)

  return (
    <div {...styles.shared} {...styles[grid ? 'center' : 'left']}>
      {shareOptions.map((props) => {
        if (props.name === 'threema' && !isIOS && !isAndroid) {
          // only show threema on mobile devices
          return
        }
        return (
          <IconButton
            {...props}
            key={props.title}
            Icon={props.icon}
            label={props.label}
            labelShort={props.label}
            fill={fill}
            onClick={(e) => {
              trackEvent([eventCategory, props.name, url])
              if (props.onClick) {
                return props.onClick(e)
              }
              if (onClose) {
                onClose()
              }
            }}
          />
        )
      })}
    </div>
  )
}

const styles = {
  shared: css({
    display: 'flex',
    flexWrap: 'wrap',
    '@media print': {
      display: 'none',
    },
    '& > a': {
      flex: 'auto',
      flexGrow: 0,
    },
  }),
  left: css({
    justifyContent: 'flex-start',
    '& > a': {
      marginTop: 15,
    },
  }),
  center: css({
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    '& > a': {
      margin: 15,
    },
  }),
}

export default compose(withT)(ShareButtons)

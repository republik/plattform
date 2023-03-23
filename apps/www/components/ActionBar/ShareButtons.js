import { useState, useEffect } from 'react'
import compose from 'lodash/flowRight'
import { css } from 'glamor'
import { IconButton } from '@project-r/styleguide'

import withT from '../../lib/withT'
import withInNativeApp, { postMessage } from '../../lib/withInNativeApp'
import { trackEvent } from '../../lib/matomo'

import copyToClipboard from 'clipboard-copy'
import { useUserAgent } from '../../lib/context/UserAgentContext'
import {
  IconLink,
  IconLogoFacebook,
  IconLogoTwitter,
  IconLogoWhatsApp,
  IconMail,
  IconShare,
  IconLogoTelegram,
  IconLogoThreema,
} from '@republik/icons'

const ShareButtons = ({
  t,
  url,
  tweet,
  title,
  emailSubject,
  emailBody,
  emailAttachUrl,
  eventCategory = 'ShareButtons',
  fill,
  onClose,
  grid,
  inNativeApp,
}) => {
  const [copyLinkSuffix, setLinkCopySuffix] = useState()
  const { isAndroid, isIOS } = useUserAgent()

  useEffect(() => {
    if (copyLinkSuffix === 'success') {
      const timeout = setTimeout(() => {
        setLinkCopySuffix()
      }, 5 * 1000)
      return () => clearTimeout(timeout)
    }
  }, [copyLinkSuffix])

  if (inNativeApp) {
    return (
      <IconButton
        style={{ marginTop: 24 }}
        title={t('article/actionbar/share')}
        Icon={IconShare}
        href={url}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(['ActionBar', 'share', url])
          postMessage({
            type: 'share',
            payload: {
              title: title,
              url: url,
              subject: emailSubject,
              dialogTitle: t('article/share/title'),
            },
          })
          e.target.blur()
        }}
        label={t('article/actionbar/share')}
        labelShort={t('article/actionbar/share')}
      />
    )
  }

  const emailAttache = emailAttachUrl ? `\n\n${url}` : ''

  const shareOptions = [
    {
      name: 'facebook',
      target: '_blank',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        url,
      )}`,
      icon: IconLogoFacebook,
      title: t('article/actionbar/facebook/title'),
      label: t('article/actionbar/facebook/label'),
    },
    {
      name: 'twitter',
      target: '_blank',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        tweet,
      )}&url=${encodeURIComponent(url)}`,
      icon: IconLogoTwitter,
      title: t('article/actionbar/twitter/title'),
      label: t('article/actionbar/twitter/label'),
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
              onClose && onClose()
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

export default compose(withInNativeApp, withT)(ShareButtons)

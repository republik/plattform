import { forwardRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CalloutMenu, IconButton } from '@project-r/styleguide'
import {
  IconGift,
  IconLink,
  IconLogoFacebook,
  IconLogoBluesky,
  IconLogoWhatsApp,
  IconLogoTelegram,
  IconMail,
  IconShare,
} from '@republik/icons'
import { css } from 'glamor'
import copyToClipboard from 'clipboard-copy'
import { trackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { postMessage } from '@/lib/withInNativeApp'
import {
  GIFT_ARTICLE_STATUS,
  CREATE_GIFT_ARTICLE_LINK,
} from './giftArticle.graphql'

const styles = {
  container: css({
    width: 260,
    padding: '4px 0',
  }),
  header: css({
    fontSize: 16,
    fontWeight: 500,
    marginBottom: 4,
    display: 'flex',
    justifyContent: 'space-between',
    gap: 4,
  }),
  description: css({
    fontSize: 14,
    lineHeight: '1.4',
    marginBottom: 16,
    opacity: 0.8,
  }),
  linkButton: css({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '8px 0',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    fontSize: 14,
    textAlign: 'left',
    ':hover': {
      opacity: 0.7,
    },
  }),
  divider: css({
    borderTop: '1px solid',
    borderColor: 'inherit',
    opacity: 0.2,
    marginTop: 4,
  }),
  exhausted: css({
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  }),
}

type GiftArticleButtonProps = {
  documentPath: string
  shareUrl: string
  emailSubject: string
  title: string
  t: (key: string, params?: Record<string, any>, fallback?: string) => string
  label?: string
  labelShort?: string
}

function getShareLinks(url: string, emailSubject: string) {
  const encoded = encodeURIComponent(url)
  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encoded}`,
    bluesky: `https://bsky.app/intent/compose?text=${encoded}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
    telegram: `https://t.me/share/url?url=${encoded}`,
    mail: `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encoded}`,
  }
}

function ShareOptions({
  getUrl,
  emailSubject,
  onCopyLink,
  linkCopied,
  trackPrefix,
  copyLabel,
  t,
}: {
  getUrl: () => Promise<string | null> | string
  emailSubject: string
  onCopyLink: () => void
  linkCopied: boolean
  trackPrefix: string
  copyLabel: string
  t: GiftArticleButtonProps['t']
}) {
  const handleOpen = async (platform: string) => {
    const url = await getUrl()
    if (!url) return
    trackEvent(['ActionBar', `${trackPrefix}:${platform}`, url])
    const links = getShareLinks(url, emailSubject)
    window.open(links[platform as keyof typeof links], '_blank')
  }

  return (
    <>
      <button {...styles.linkButton} onClick={onCopyLink}>
        <IconLink size={20} />
        <span>
          {linkCopied ? t('article/actionbar/gift/copied') : copyLabel}
        </span>
      </button>
      <div {...styles.divider} />
      <button {...styles.linkButton} onClick={() => handleOpen('facebook')}>
        <IconLogoFacebook size={20} />
        <span>Facebook</span>
      </button>
      <button {...styles.linkButton} onClick={() => handleOpen('bluesky')}>
        <IconLogoBluesky size={20} />
        <span>Bluesky</span>
      </button>
      <button {...styles.linkButton} onClick={() => handleOpen('whatsapp')}>
        <IconLogoWhatsApp size={20} />
        <span>WhatsApp</span>
      </button>
      <button {...styles.linkButton} onClick={() => handleOpen('telegram')}>
        <IconLogoTelegram size={20} />
        <span>Telegram</span>
      </button>
      <button {...styles.linkButton} onClick={() => handleOpen('mail')}>
        <IconMail size={20} />
        <span>E-Mail</span>
      </button>
    </>
  )
}

export default function GiftArticleButton({
  documentPath,
  shareUrl,
  emailSubject,
  title,
  t,
  label,
  labelShort,
}: GiftArticleButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [giftUrl, setGiftUrl] = useState<string | null>(null)
  const { isNativeApp, isIOS, isAndroid } = usePlatformInformation()
  const useNativeShare =
    isNativeApp ||
    (typeof navigator !== 'undefined' &&
      !!navigator?.share &&
      (isAndroid || isIOS))

  const { data, loading } = useQuery(GIFT_ARTICLE_STATUS, {
    variables: { documentPath },
  })

  const [createLink, { loading: creating }] = useMutation(
    CREATE_GIFT_ARTICLE_LINK,
    {
      variables: { documentPath },
      refetchQueries: [
        { query: GIFT_ARTICLE_STATUS, variables: { documentPath } },
      ],
    },
  )

  const status = data?.giftArticleStatus
  const remaining = status?.remainingGiftsThisMonth ?? 0
  const max = status?.maxGiftsPerMonth ?? 10
  const existingUrl = status?.existingLink?.url
  const effectiveUrl = giftUrl || existingUrl
  const isExhausted = remaining === 0 && !existingUrl // exhausted only if no gifts left AND no existing gift URL

  const ensureGiftUrl = async (): Promise<string | null> => {
    if (effectiveUrl) return effectiveUrl
    try {
      const result = await createLink()
      const url = result.data?.createGiftArticleLink?.url
      if (url) setGiftUrl(url)
      return url || null
    } catch {
      return null
    }
  }

  const handleNativeShare = async () => {
    const url = await ensureGiftUrl()
    if (!url) return
    trackEvent(['ActionBar', 'giftArticle:nativeShare', url])

    if (isNativeApp) {
      postMessage({
        type: 'share',
        payload: {
          title,
          url,
          subject: emailSubject,
          dialogTitle: t('article/actionbar/gift/title'),
        },
      })
    } else if (navigator?.share) {
      try {
        await navigator.share({ title, url })
      } catch {}
    }
  }

  const handleCopyGiftLink = async () => {
    const url = await ensureGiftUrl()
    if (!url) return
    await copyToClipboard(url)
    setLinkCopied(true)
    trackEvent(['ActionBar', 'giftArticle:copyLink', url])
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const handleCopyRegularLink = async () => {
    await copyToClipboard(shareUrl)
    setLinkCopied(true)
    trackEvent(['ActionBar', 'giftArticle:copyRegularLink', shareUrl])
    setTimeout(() => setLinkCopied(false), 3000)
  }

  const handleNativeShareRegular = async () => {
    trackEvent(['ActionBar', 'giftArticle:nativeShareRegular', shareUrl])
    if (isNativeApp) {
      postMessage({
        type: 'share',
        payload: {
          title,
          url: shareUrl,
          subject: emailSubject,
          dialogTitle: t('article/actionbar/share'),
        },
      })
    } else if (navigator?.share) {
      try {
        await navigator.share({ title, url: shareUrl })
      } catch {}
    }
  }

  const Icon = forwardRef<HTMLAnchorElement & HTMLButtonElement>(
    (props, ref) => (
      <IconButton
        Icon={IconGift}
        label={label || ''}
        labelShort={labelShort || ''}
        ref={ref}
        style={{ marginRight: 24 }}
        {...props}
      />
    ),
  )

  return (
    <CalloutMenu Element={Icon} elementProps={{}} align='right'>
      <div {...styles.container}>
        <div {...styles.header}>
          <span>{t('article/actionbar/gift/title')}</span>
          <span>
            {remaining}/{max}
          </span>
        </div>

        {isExhausted ? (
          <>
            <div {...styles.exhausted}>
              {t('article/actionbar/gift/exhausted')}
            </div>
            <div
              {...styles.description}
              style={{ marginTop: 12, marginBottom: 8 }}
            >
              {t('article/actionbar/gift/shareAnyway')}
            </div>
            {useNativeShare ? (
              <button {...styles.linkButton} onClick={handleNativeShareRegular}>
                <IconShare size={20} />
                <span>{t('article/actionbar/share')}</span>
              </button>
            ) : (
              <ShareOptions
                getUrl={() => shareUrl}
                emailSubject={emailSubject}
                onCopyLink={handleCopyRegularLink}
                linkCopied={linkCopied}
                trackPrefix='giftArticle:shareRegular'
                copyLabel={t('article/actionbar/gift/copyLink/regular')}
                t={t}
              />
            )}
          </>
        ) : (
          <>
            <div {...styles.description}>
              {t('article/actionbar/gift/description')}
            </div>
            {useNativeShare ? (
              <button
                {...styles.linkButton}
                onClick={handleNativeShare}
                disabled={creating || loading}
              >
                <IconShare size={20} />
                <span>{t('article/actionbar/gift/nativeShare')}</span>
              </button>
            ) : (
              <ShareOptions
                getUrl={ensureGiftUrl}
                emailSubject={emailSubject}
                onCopyLink={handleCopyGiftLink}
                linkCopied={linkCopied}
                trackPrefix='giftArticle:share'
                copyLabel={t('article/actionbar/gift/copyLink')}
                t={t}
              />
            )}
          </>
        )}
      </div>
    </CalloutMenu>
  )
}

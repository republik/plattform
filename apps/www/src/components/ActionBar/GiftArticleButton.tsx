import { forwardRef, useState } from 'react'
import { useMutation, useQuery } from '@apollo/client'
import { CalloutMenu, IconButton } from '@project-r/styleguide'
import {
  IconGift,
  IconLink,
  IconLogoWhatsApp,
  IconLogoTelegram,
  IconLogoThreema,
  IconMail,
} from '@republik/icons'
import { css } from 'glamor'
import copyToClipboard from 'clipboard-copy'
import { trackEvent } from '@/app/lib/analytics/event-tracking'
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
  shareRow: css({
    display: 'flex',
    gap: 16,
    paddingTop: 8,
    borderTop: '1px solid',
    borderColor: 'inherit',
    marginTop: 8,
  }),
  shareIcon: css({
    cursor: 'pointer',
    opacity: 0.7,
    ':hover': {
      opacity: 1,
    },
  }),
  exhausted: css({
    fontSize: 14,
    opacity: 0.6,
    fontStyle: 'italic',
  }),
}

type GiftArticleButtonProps = {
  documentPath: string
  emailSubject: string
  t: (key: string, params?: Record<string, any>, fallback?: string) => string
  label?: string
  labelShort?: string
}

export default function GiftArticleButton({
  documentPath,
  emailSubject,
  t,
  label,
  labelShort,
}: GiftArticleButtonProps) {
  const [linkCopied, setLinkCopied] = useState(false)
  const [giftUrl, setGiftUrl] = useState<string | null>(null)

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

  const handleGenerateAndCopy = async () => {
    try {
      let url = effectiveUrl
      if (!url) {
        const result = await createLink()
        url = result.data?.createGiftArticleLink?.url
        setGiftUrl(url)
      }
      if (url) {
        await copyToClipboard(url)
        setLinkCopied(true)
        trackEvent(['ActionBar', 'giftArticle:copyLink', url])
        setTimeout(() => setLinkCopied(false), 3000)
      }
    } catch (e) {
      // error shown via Apollo
    }
  }

  const handleShare = async (platform: string) => {
    let url = effectiveUrl
    if (!url) {
      try {
        const result = await createLink()
        url = result.data?.createGiftArticleLink?.url
        setGiftUrl(url)
      } catch {
        return
      }
    }
    if (!url) return

    trackEvent(['ActionBar', `giftArticle:share:${platform}`, url])

    const encoded = encodeURIComponent(url)
    const links: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
      threema: `https://threema.id/compose?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${encoded}`,
      mail: `mailto:?subject=${encodeURIComponent(
        emailSubject,
      )}&body=${encoded}`,
    }
    window.open(links[platform], '_blank')
  }

  const isExhausted = remaining === 0 && !existingUrl

  const Icon = forwardRef<HTMLAnchorElement & HTMLButtonElement>((props, ref) => (
    <IconButton
      Icon={IconGift}
      label={label || ''}
      labelShort={labelShort || ''}
      ref={ref}
      style={{ marginRight: 24 }}
      {...props}
    />
  ))

  return (
    <CalloutMenu Element={Icon} elementProps={{}} align='right'>
      <div {...styles.container}>
        <div {...styles.header}>
          <span>
          {t('article/actionbar/gift/title')}
          </span>
          <span>
            {remaining}/{max}
          </span>
        </div>

        {isExhausted ? (
          <div {...styles.exhausted}>
            {t('article/actionbar/gift/exhausted')}
          </div>
        ) : (
          <>
            <div {...styles.description}>
              {t('article/actionbar/gift/description')}
            </div>

            <button
              {...styles.linkButton}
              onClick={handleGenerateAndCopy}
              disabled={creating || loading}
            >
              <IconLink size={20} />
              <span>
                {linkCopied
                  ? t('article/actionbar/gift/copied')
                  : t('article/actionbar/gift/copyLink')}
              </span>
            </button>

            <div {...styles.shareRow}>
              <span
                {...styles.shareIcon}
                onClick={() => handleShare('whatsapp')}
              >
                <IconLogoWhatsApp size={24} />
              </span>
              <span
                {...styles.shareIcon}
                onClick={() => handleShare('threema')}
              >
                <IconLogoThreema size={24} />
              </span>
              <span
                {...styles.shareIcon}
                onClick={() => handleShare('telegram')}
              >
                <IconLogoTelegram size={24} />
              </span>
              <span {...styles.shareIcon} onClick={() => handleShare('mail')}>
                <IconMail size={24} />
              </span>
            </div>
          </>
        )}
      </div>
    </CalloutMenu>
  )
}

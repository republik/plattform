'use client'

// import { CreateGiftArticleTokenDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { Spinner } from '@/app/components/ui/spinner'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { PUBLIC_BASE_URL } from '@/lib/constants'
import copyToClipboard from 'clipboard-copy'
import { Gift, Link } from 'lucide-react'
import { useState } from 'react'
import {
  ACTION_ICON_SIZE,
  actionLabelStyle,
  actionStyle,
  noteStyle,
} from './action-style'
import { type ShareActionProps } from './share-action'
import { getShareTargets } from './share-targets'

const GIFT_LABEL = 'Verschenken'

/** The article URL with the signed token, as recipients open it. */
function toGiftUrl(path: string, token: string | null | undefined) {
  if (!token) {
    return null
  }
  const url = new URL(path, PUBLIC_BASE_URL)
  url.searchParams.set('gift', token)
  return url.toString()
}

// TODO: make sure the link gen actually works both in gifts and from the share action
// This is its own component so we can also display it in the share action menu
export function GiftActionMenu({ documentId, title, path }: ShareActionProps) {
  const emailSubject = `Republik: ${title}`
  const trackEvent = useTrackEvent()
  const [linkCopied, setLinkCopied] = useState(false)

  /*const [createToken, { data, loading, error }] = useMutation(
    CreateGiftArticleTokenDocument,
    { variables: { documentId } },
  )
  */
  const loading = false
  const error = false
  const data = { createGiftArticleToken: '1234' }
  const giftUrl = toGiftUrl(path, data?.createGiftArticleToken)

  return (
    <>
      <p className={noteStyle}>
        Gewähre freien Zugang zu diesem Beitrag. In zwei Wochen ist der Link
        abgelaufen.
      </p>
      {error ? (
        <p className={noteStyle}>
          Der Geschenk-Link konnte nicht erstellt werden. Bitte versuchen Sie es
          später noch einmal.
        </p>
      ) : !giftUrl ? (
        <div className={menuItemStyle} aria-live='polite'>
          <Spinner size='small' />
          Link wird erstellt …
        </div>
      ) : (
        <GiftShareTargets
          url={giftUrl}
          emailSubject={emailSubject}
          linkCopied={linkCopied}
          onCopy={() => {
            trackEvent({ action: 'giftButton:copyLink', name: giftUrl })
            copyToClipboard(giftUrl).then(() => setLinkCopied(true))
          }}
        />
      )}
    </>
  )
}

export function GiftAction({ documentId, title, path }: ShareActionProps) {
  const emailSubject = `Republik: ${title}`
  const { isNativeApp } = usePlatformInformation()
  const postMessage = usePostMessage()
  const trackEvent = useTrackEvent()

  /*const [createToken, { data, loading, error }] = useMutation(
    CreateGiftArticleTokenDocument,
    { variables: { documentId } },
  )
  */
  const loading = false
  const data = { createGiftArticleToken: '1234' }
  const giftUrl = toGiftUrl(path, data?.createGiftArticleToken)

  const mintLink = async (): Promise<string | null> => {
    // Closing and reopening the menu while the request is still out would
    // otherwise send a second one.
    if (giftUrl || loading) {
      return giftUrl
    }
    try {
      /*const result = await createToken()
      return toGiftUrl(path, result.data?.createGiftArticleToken)*/
      return toGiftUrl(path, data?.createGiftArticleToken)
    } catch {
      // Surfaced through `error` below.
      return null
    }
  }

  // The app has its own share sheet: no menu, so the link is minted on the tap.
  if (isNativeApp) {
    return (
      <button
        className={actionStyle}
        disabled={loading}
        onClick={async () => {
          const url = await mintLink()
          if (!url) {
            return
          }
          trackEvent({ action: 'giftNative', name: url })
          postMessage({
            type: 'share',
            payload: {
              title,
              url,
              message:
                'Gewähre freien Zugang zu diesem Beitrag. In zwei Wochen ist der Link abgelaufen.',
              subject: emailSubject,
              dialogTitle: GIFT_LABEL,
            },
          })
        }}
        type='button'
      >
        <Gift size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>{GIFT_LABEL}</span>
      </button>
    )
  }

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger aria-label={GIFT_LABEL} className={actionStyle}>
        <Gift size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>{GIFT_LABEL}</span>
      </Menu.Trigger>
      <Menu.Content title={GIFT_LABEL}>
        <GiftActionMenu title={title} path={path} documentId={documentId} />
      </Menu.Content>
    </Menu.Root>
  )
}

function GiftShareTargets({
  url,
  emailSubject,
  linkCopied,
  onCopy,
}: {
  url: string
  emailSubject: string
  linkCopied: boolean
  onCopy: () => void
}) {
  const trackEvent = useTrackEvent()

  return (
    <>
      <Menu.Item asChild>
        <a
          className={menuItemStyle}
          href={url}
          onClick={(e) => {
            e.preventDefault()
            onCopy()
          }}
        >
          <Link size={ACTION_ICON_SIZE} />
          {linkCopied ? 'Link kopiert' : 'Link kopieren'}
        </a>
      </Menu.Item>
      {getShareTargets(url, emailSubject).map(
        ({ name, href, icon: Icon, label }) => (
          <Menu.Item asChild key={name}>
            <a
              className={menuItemStyle}
              href={href}
              onClick={() =>
                trackEvent({ action: `giftButton:${name}`, name: url })
              }
              rel='noreferrer'
              target='_blank'
            >
              <Icon size={ACTION_ICON_SIZE} />
              {label}
            </a>
          </Menu.Item>
        ),
      )}
    </>
  )
}

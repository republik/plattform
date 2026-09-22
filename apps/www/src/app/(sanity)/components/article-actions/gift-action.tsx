'use client'

import { CreateGiftArticleLinkDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { Menu, menuItemStyle } from '@/app/components/ui/responsive-menu'
import { Spinner } from '@/app/components/ui/spinner'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { usePlatformInformation } from '@/app/lib/hooks/usePlatformInformation'
import { usePostMessage } from '@/app/lib/hooks/usePostMessage'
import { useMe } from '@/lib/context/MeContext'
import { useMutation } from '@apollo/client'
import { css } from '@republik/theme/css'
import copyToClipboard from 'clipboard-copy'
import { Gift, Link } from 'lucide-react'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionLabelStyle, actionStyle } from './action-style'
import { MENU_SIDE_OFFSET } from './menu-style'
import { ShareAction, type ShareActionProps } from './share-action'
import { getShareTargets } from './share-targets'

const GIFT_LABEL = 'Verschenken'

const noteStyle = css({
  color: 'textSoft',
  fontSize: 'xs',
  lineHeight: 1.4,
  paddingBottom: '2',
  paddingTop: '1',
  paddingX: '5',
  textStyle: 'sans',
})

export type ShareOrGiftActionProps = ShareActionProps & {
  /** Sanity document ref — what a gift link is minted against. */
  documentId: string
}

/**
 * Members hand the article out as a gift; everyone else just shares it.
 *
 * Deliberately one action rather than two: the gift menu already carries every
 * target the share menu does, so offering both would only ask the reader to
 * pick between two versions of the same link.
 */
export function ShareOrGiftAction({
  documentId,
  ...shareProps
}: ShareOrGiftActionProps) {
  // Same pair as the bookmark action: the `member` role alone also covers
  // trial and "Abo teilen" readers, who have nothing of their own to give
  // away.
  const { isMember, hasActiveMembership } = useMe()

  // Membership isn't known on the first paint, so this starts as the plain
  // share menu and swaps once it is.
  if (!isMember || !hasActiveMembership) {
    return <ShareAction {...shareProps} />
  }

  return <GiftAction documentId={documentId} {...shareProps} />
}

function GiftAction({
  documentId,
  title,
  path,
  align = 'end',
  menuOffsetX = 0,
  menuSideOffset = MENU_SIDE_OFFSET,
  triggerRef,
}: ShareOrGiftActionProps) {
  const emailSubject = `Republik: ${title}`
  const { isNativeApp } = usePlatformInformation()
  const postMessage = usePostMessage()
  const trackEvent = useTrackEvent()
  const [linkCopied, setLinkCopied] = useState(false)

  const [createLink, { data, loading, error }] = useMutation(
    CreateGiftArticleLinkDocument,
    { variables: { documentId, documentPath: path } },
  )
  const giftUrl = data?.createGiftArticleLink.url ?? null

  // Minting is idempotent — the backend hands back the member's existing live
  // link for this article — so it can happen up front, as the menu opens,
  // rather than on the way out of it. That matters: a share target opened
  // *after* an await is a popup the browser didn't see the user ask for, and
  // gets blocked.
  const mintLink = async (): Promise<string | null> => {
    // Closing and reopening the menu while the first request is still out
    // would otherwise send a second one.
    if (giftUrl || loading) {
      return giftUrl
    }
    try {
      const result = await createLink()
      return result.data?.createGiftArticleLink.url ?? null
    } catch {
      // Surfaced through `error` below.
      return null
    }
  }

  // The app has its own share sheet, so there is no menu to open early — mint
  // on the tap itself, which is a handler the app is happy to act on.
  if (isNativeApp) {
    return (
      <button
        ref={triggerRef}
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
    <Menu.Root
      modal={false}
      onOpenChange={(open) => {
        if (open) {
          mintLink()
        }
      }}
    >
      <Menu.Trigger
        ref={triggerRef}
        aria-label={GIFT_LABEL}
        className={actionStyle}
      >
        <Gift size={ACTION_ICON_SIZE} />
        <span className={actionLabelStyle}>{GIFT_LABEL}</span>
      </Menu.Trigger>
      <Menu.Content
        align={align}
        sideOffset={menuSideOffset}
        collisionPadding={16}
        title={GIFT_LABEL}
        style={
          menuOffsetX
            ? { transform: `translateX(${menuOffsetX}px)` }
            : undefined
        }
      >
        <p className={noteStyle}>
          Wer diesen Link öffnet, liest den Artikel 14 Tage lang ohne Abo.
        </p>
        {error ? (
          <p className={noteStyle}>
            Der Geschenk-Link konnte nicht erstellt werden. Bitte versuchen Sie
            es später noch einmal.
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
    </>
  )
}

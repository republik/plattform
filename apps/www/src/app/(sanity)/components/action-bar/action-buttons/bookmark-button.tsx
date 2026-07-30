'use client'

import { Spinner } from '@/app/components/ui/spinner'
import { useTrackEvent } from '@/app/lib/analytics/event-tracking'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import {
  AddArticleBookmarkDocument,
  ArticleBookmarkDocument,
  RemoveArticleBookmarkDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { css } from '@republik/theme/css'
import { useState } from 'react'
import { ACTION_ICON_SIZE, actionButtonStyle } from './action-button'

export function BookmarkButton({
  canBookmark,
  documentId,
}: {
  /** Resolved by the caller from server-seeded membership. */
  canBookmark: boolean
  documentId?: string
}) {
  const client = useApolloClient()
  const trackEvent = useTrackEvent()
  const [isPending, setIsPending] = useState(false)
  const [showSpinner, setShowSpinner] = useState(false)
  const [failed, setFailed] = useState(false)

  const { data, loading } = useQuery(ArticleBookmarkDocument, {
    variables: { documentId },
    skip: !documentId || !canBookmark,
  })
  const [addBookmark] = useMutation(AddArticleBookmarkDocument)
  const [removeBookmark] = useMutation(RemoveArticleBookmarkDocument)

  // No repoId means the collections API has nothing to attach a bookmark to.
  if (!documentId || !canBookmark) {
    return null
  }

  const isBookmarked = !!data?.userCollectionItem

  async function toggleBookmark() {
    if (isPending) return

    setIsPending(true)
    setFailed(false)
    // The button is disabled for the whole request, but the spinner only
    // appears if it takes longer than a second.
    const spinner = setTimeout(() => setShowSpinner(true), 1000)

    // `userCollectionItem` is a root query field, so a mutation result can't
    // normalise into it — write the new state into the cache directly. Doing it
    // before awaiting makes the label flip immediately.
    const writeBookmarked = (item: { id: string; createdAt: string } | null) =>
      client.writeQuery({
        query: ArticleBookmarkDocument,
        variables: { documentId },
        data: {
          userCollectionItem: item && {
            // The root field returns `CollectionItemRef` — a reference with no
            // resolved document, per the collections architecture decision.
            __typename: 'CollectionItemRef' as const,
            ...item,
          },
        },
      })

    const previous = data?.userCollectionItem ?? null
    writeBookmarked(
      isBookmarked
        ? null
        : {
            id: `optimistic-${documentId}`,
            createdAt: new Date().toISOString(),
          },
    )

    try {
      const mutate = isBookmarked ? removeBookmark : addBookmark
      const result = await mutate({ variables: { documentId } })
      const added =
        result.data && 'addDocumentToCollection' in result.data
          ? result.data.addDocumentToCollection
          : null
      if (added) {
        writeBookmarked({ id: added.id, createdAt: added.createdAt })
      }
      trackEvent({
        action: isBookmarked ? 'bookmarkRemove' : 'bookmarkAdd',
        name: documentId,
      })
    } catch (error) {
      writeBookmarked(previous)
      setFailed(true)
      console.warn('ActionBar: could not toggle bookmark', error)
    } finally {
      clearTimeout(spinner)
      setShowSpinner(false)
      setIsPending(false)
    }
  }

  // Membership is known before this renders, so there is no wrapper and no
  // CSS gate: non-members never receive the button in the HTML at all. The
  // Pages Router used `data-show-if-active-membership` for this, which relies on
  // a `next/head` script that does nothing in the App Router.
  return (
    <button
      className={actionButtonStyle}
      data-active={isBookmarked || undefined}
      disabled={isPending || loading}
      onClick={toggleBookmark}
      title={isBookmarked ? 'Lesezeichen entfernen' : 'Lesezeichen hinzufügen'}
      type='button'
    >
      {showSpinner ? (
        <Spinner size='small' />
      ) : isBookmarked ? (
        <BookmarkCheck size={ACTION_ICON_SIZE} />
      ) : (
        <Bookmark
          className={failed ? css({ color: 'error' }) : undefined}
          size={ACTION_ICON_SIZE}
        />
      )}
      {isBookmarked ? 'Gemerkt' : 'Merken'}
    </button>
  )
}

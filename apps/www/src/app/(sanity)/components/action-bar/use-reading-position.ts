'use client'

import { useMe } from '@/lib/context/MeContext'
import { UpsertDocumentProgressDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'

/**
 * Reading position of the current article, keyed by `sanity:<_id>` — the same
 * reference bookmarks use (see `collectionsDocumentId`).
 *
 * WRITING works: `upsertDocumentProgress` accepts a Sanity reference and returns
 * the stored values.
 *
 * READING does not exist yet. `userCollectionItem(collectionName: "progress")`
 * returns a `CollectionItemRef` — `{ id, createdAt, repoId, sanityId }` — which
 * says *that* a position is stored but not what it is; `percentage`, `nodeId` and
 * `max` are not selectable on it, and there is no root `documentProgress` field.
 * `Document.userProgress` is no help either: Sanity-backed items resolve to a
 * null `Document` by design.
 *
 * So the position indicator cannot render and scroll restore has nothing to
 * restore to. Both come back as soon as the API exposes the values by document
 * id — at which point this hook regains its query and `percent`/`position` stop
 * being undefined. Nothing else in the action bar needs to change.
 */
export function useReadingPosition({ documentId }: { documentId?: string }) {
  const { isMember } = useMe()
  const [upsertProgress] = useMutation(UpsertDocumentProgressDocument)

  return {
    /** Rounded percentage — always undefined until the API exposes it. */
    percent: undefined as number | undefined,
    isRead: false,
    /** Stored position to scroll back to — unavailable for the same reason. */
    position: undefined as
      | { nodeId?: string | null; percentage?: number | null }
      | undefined,
    loading: false,
    // Gated on membership because the reference now exists for every article,
    // so without this the menu would offer signed-out readers an action the API
    // rejects. Failures are swallowed with a warning, as in `PlayButton`.
    markAsRead:
      documentId && isMember
        ? async () => {
            try {
              await upsertProgress({
                variables: { documentId, percentage: 1, nodeId: '' },
              })
            } catch (error) {
              console.warn('ActionBar: could not mark article as read', error)
            }
          }
        : undefined,
  }
}

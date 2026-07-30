import { useInNativeApp } from '@/lib/withInNativeApp'
import compareVersion from '@/lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from '../constants'
import { useMe } from '@/lib/context/MeContext'
import createPersistedState from '@/lib/hooks/use-persisted-state'
import { AudioPlayerItem, AudioQueueItem } from '../types/AudioPlayerItem'
import { rememberAudioItem, getKnownAudioItem } from '../helpers/audioItemCache'
import { getAudioQueueItemsByIds } from '@/app/(sanity)/groq/audio-queue-items-server'
import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { ApolloCache, ApolloError, useMutation, useQuery } from '@apollo/client'
import { reportError } from '@/lib/errors/reportError'
import { useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import {
  AddAudioQueueItemRefDocument,
  AudioQueueEntityType,
  AudioQueueItemRefFragment,
  AudioQueueItemRefFragmentDoc,
  AudioQueueQueryDocument,
  ClearAudioQueueDocument,
  MoveAudioQueueItemDocument,
  RemoveAudioQueueItemDocument,
  ReorderAudioQueueDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { getFragmentData } from '#graphql/cms/__generated__/gql'

const usePersistedAudioState = createPersistedState<AudioQueueItem>(
  'audio-player-local-state',
)

const MAX_QUEUE_SIZE = 20

/**
 * The audio queue API stores refs (`repoId` XOR `sanityId`, no content) — the
 * same join key `document-id.ts` produces for bookmarks. Recomputing it here
 * from a ref lets us look up whatever metadata `handleAddQueueItem` cached
 * for that id when it was added.
 */
function refDocumentId(ref: AudioQueueItemRefFragment): string | null {
  if (ref.repoId) return btoa(ref.repoId)
  if (ref.sanityId) return `sanity:${ref.sanityId}`
  return null
}

/**
 * Shapes a Sanity `AUDIO_QUEUE_ITEMS_QUERY` result into an `AudioPlayerItem`.
 * Cover art is intentionally left out — resizing a raw Sanity image URL
 * client-side isn't wired up, and `AudioCover` already falls back to a
 * generated placeholder when `image` is unset.
 */
function toAudioPlayerItem(content: AudioQueueItemContent): AudioPlayerItem {
  const id = `sanity:${content._id}`
  return {
    id,
    meta: {
      title: content.title,
      path: content.path,
      publishDate: content.publishDate,
      audioSource: {
        mediaId: id,
        mp3: content.audioSourceMp3,
        durationMs: content.audioDurationMs ?? 0,
      },
    },
  } as unknown as AudioPlayerItem
}

/**
 * Attach cached metadata to a ref, so the rest of the player (which expects
 * `document.meta...`) doesn't need to know refs exist. `mediaId` and
 * `userProgress` come from the server, which is authoritative for both —
 * overriding whatever placeholder the caller guessed when it built the item.
 */
function mergeQueueItem(
  ref: AudioQueueItemRefFragment,
  knownItem: AudioPlayerItem | undefined,
): AudioQueueItem {
  return {
    id: ref.id,
    sequence: ref.sequence,
    document: knownItem
      ? {
          ...knownItem,
          meta: {
            ...knownItem.meta,
            audioSource: {
              ...knownItem.meta.audioSource,
              mediaId: ref.mediaId ?? knownItem.meta.audioSource.mediaId,
              userProgress: ref.userProgress ?? null,
            },
          },
        }
      : null,
  }
}

/**
 * useAudioQueue acts as a provider for the audio queue and all it's mutations.
 * Additionally, it provides the user-progress for all queued audio-items.
 *d
 * For users with an active membership, the queue is synchronized with the server.
 * For users without an active membership, the queue is persisted in local storage.
 * The local storage however doesn't allow for more than one item to be saved.
 */
const useAudioQueue = (): {
  audioQueue: AudioQueueItem[]
  audioQueueIsLoading: boolean
  audioQueueHasError?: ApolloError | null
  refetchAudioQueue: () => Promise<unknown>
  addAudioQueueItem: (
    item: AudioPlayerItem,
    position?: number,
  ) => Promise<AudioQueueItem[]>
  removeAudioQueueItem: (audioItemId: string) => Promise<void>
  clearAudioQueue: () => Promise<void>
  moveAudioQueueItem: (audioItemId: string, position: number) => Promise<void>
  reorderAudioQueue: (reorderedQueueItems: AudioQueueItem[]) => Promise<void>
  isAudioQueueAvailable: boolean
  checkIfHeadOfQueue: (documentId: string) => AudioQueueItem
  checkIfInQueue: (audioItemId: string) => AudioQueueItem
  getAudioQueueItemIndex: (documentId: string) => number
} => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  const { meLoading, me } = useMe()
  const {
    data: audioQueueData,
    loading: audioQueueIsLoading,
    error: audioQueueHasError,
    refetch: refetchAudioQueue,
  } = useQuery(AudioQueueQueryDocument, {
    skip: meLoading || !me,
    errorPolicy: 'all',
  })
  const audioQueueRefs = getFragmentData(
    AudioQueueItemRefFragmentDoc,
    audioQueueData?.userAudioQueue || [],
  )
  // `audioItemCache` only lives for the current page session — a reload
  // loses it, since nothing was added/played yet to repopulate it. For
  // Sanity-backed refs (which, unlike legacy repoIds, have a real batch
  // content lookup) fetch whatever the cache doesn't already know, so a
  // reloaded queue still renders. Legacy repoId items have no such lookup
  // (only `document(path:)`, singular) and stay session-only — an accepted
  // gap, since that content is being migrated to Sanity regardless.
  const [hydratedSanityItems, setHydratedSanityItems] = useState<
    Map<string, AudioPlayerItem>
  >(new Map())

  const missingSanityIds = audioQueueRefs
    .filter(
      (ref) =>
        ref.sanityId &&
        !getKnownAudioItem(refDocumentId(ref)) &&
        !hydratedSanityItems.has(ref.sanityId),
    )
    .map((ref) => ref.sanityId)

  useEffect(() => {
    if (missingSanityIds.length === 0) return
    let cancelled = false
    getAudioQueueItemsByIds(missingSanityIds)
      .then((items) => {
        if (cancelled || items.length === 0) return
        setHydratedSanityItems((previous) => {
          const next = new Map(previous)
          items.forEach((item) => next.set(item._id, toAudioPlayerItem(item)))
          return next
        })
      })
      .catch((error) => reportError('useAudioQueue: hydrate from Sanity', error))
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingSanityIds.join(',')])

  const audioQueueItems = audioQueueRefs.map((ref) =>
    mergeQueueItem(
      ref,
      getKnownAudioItem(refDocumentId(ref)) ??
        (ref.sanityId ? hydratedSanityItems.get(ref.sanityId) : undefined),
    ),
  )
  const isLoading = meLoading || audioQueueIsLoading

  const [localAudioItem, setLocalAudioItem] =
    usePersistedAudioState<AudioQueueItem>(null)

  useEffect(() => {
    if (audioQueueHasError) {
      reportError('useAudioQueue', audioQueueHasError)
    }
  }, [audioQueueHasError])

  const modifyApolloCacheWithUpdatedPlaylist = (
    cache: ApolloCache<any>,
    { data: { audioQueueItems } },
  ) => {
    cache.writeQuery({
      query: AudioQueueQueryDocument,
      data: { userAudioQueue: audioQueueItems },
    })
  }

  /**
   * Cache update for mutations that only return Id's and sequence
   * Creates an updated audioqueue from the server response without
   * fetching the full audioqueue data from the server.
   */
  const updateCacheWithMinimalData = (
    cache: ApolloCache<any>,
    { data: { audioQueueItems } },
  ) => {
    const data = cache.readQuery({ query: AudioQueueQueryDocument })
    if (!data) return

    const cachedItemsById = new Map(
      (data.userAudioQueue || []).map((item) => [item.id, item]),
    )

    const updatedQueue = audioQueueItems
      .map((serverItem) => cachedItemsById.get(serverItem.id))
      .filter(Boolean) // Remove any items not found in cache

    cache.writeQuery({
      query: AudioQueueQueryDocument,
      data: { userAudioQueue: updatedQueue },
    })
  }

  const [addAudioQueueItemMutation] = useMutation(AddAudioQueueItemRefDocument, {
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [removeAudioQueueItemMutation] = useMutation(
    RemoveAudioQueueItemDocument,
    { update: updateCacheWithMinimalData },
  )
  const [moveAudioQueueItemMutation] = useMutation(MoveAudioQueueItemDocument, {
    update: updateCacheWithMinimalData,
  })
  const [clearAudioQueueMutation] = useMutation(ClearAudioQueueDocument, {
    update: updateCacheWithMinimalData,
  })
  const [reorderAudioQueueMutation] = useMutation(ReorderAudioQueueDocument, {
    update: updateCacheWithMinimalData,
  })

  /**
   * Add an audio item to the queue or to the local storage if the user is not a member.
   * @param item partial of a document with all the required meta fields
   * @param position position in the queue. To push to front of queue, pass 1
   */
  const handleAddQueueItem = async (
    item: AudioPlayerItem,
    position?: number,
  ): Promise<AudioQueueItem[]> => {
    rememberAudioItem(item.id, item)

    if (me) {
      // Enforce queue limit by removing oldest item (end of queue) before adding
      if (audioQueueItems.length >= MAX_QUEUE_SIZE) {
        const lastItem = audioQueueItems[audioQueueItems.length - 1]
        await removeAudioQueueItemMutation({ variables: { id: lastItem.id } })
      }

      const { data } = await addAudioQueueItemMutation({
        variables: {
          entity: {
            id: item.id,
            type: AudioQueueEntityType.Document,
          },
          sequence: position,
        },
      })
      const refs = getFragmentData(
        AudioQueueItemRefFragmentDoc,
        data?.audioQueueItems || [],
      )
      return refs.map((ref) => mergeQueueItem(ref, getKnownAudioItem(refDocumentId(ref))))
    } else {
      const mockAudioQueueItem: AudioQueueItem = {
        id: uuid(),
        document: item,
        sequence: 0,
      }
      setLocalAudioItem(mockAudioQueueItem)
      return [mockAudioQueueItem]
    }
  }

  /**
   * Remove an item from the queue or from the local storage if the user is not a member.
   * @param audioItemId
   */
  const handleRemoveQueueItem = async (audioItemId: string): Promise<void> => {
    if (me) {
      await removeAudioQueueItemMutation({
        variables: { id: audioItemId },
        optimisticResponse: {
          audioQueueItems: audioQueueRefs.filter(
            (item) => item.id !== audioItemId,
          ),
        },
      })
    } else {
      setLocalAudioItem(null)
    }
  }

  const handleMoveQueueItem = async (
    audioItemId: string,
    position: number,
  ): Promise<void> => {
    if (me) {
      await moveAudioQueueItemMutation({
        variables: { id: audioItemId, sequence: position },
      })
    }
  }

  const handleClearQueue = async (): Promise<void> => {
    if (me) {
      await clearAudioQueueMutation({
        optimisticResponse: { audioQueueItems: [] },
      })
    } else {
      setLocalAudioItem(null)
    }
  }

  const handleQueueReorder = async (
    reorderedQueue: AudioQueueItem[],
  ): Promise<void> => {
    if (me) {
      await reorderAudioQueueMutation({
        variables: { ids: reorderedQueue.map(({ id }) => id) },
        optimisticResponse: {
          audioQueueItems: reorderedQueue.map((item, index) => ({
            id: item.id,
            sequence: index + 1,
            __typename: 'AudioQueueItemRef' as const,
          })),
        },
      })
    }
  }

  function checkIfHeadOfQueue(documentId: string): AudioQueueItem {
    if (!me && localAudioItem?.document?.id === documentId) {
      return localAudioItem
    }
    if (audioQueueItems[0]?.document?.id === documentId) {
      return audioQueueItems[0]
    }
  }

  function checkIfInQueue(documentId: string): AudioQueueItem {
    if (!me && localAudioItem?.document?.id === documentId) {
      return localAudioItem
    }
    return audioQueueItems.find(
      (audioQueueItem) => audioQueueItem.document?.id === documentId,
    )
  }

  function getAudioQueueItemIndex(documentId: string): number {
    if (!me && localAudioItem?.document?.id === documentId) {
      return 0
    }
    return audioQueueItems.findIndex((item) => item.document?.id === documentId)
  }

  const resolvedQueue = !me
    ? [localAudioItem].filter(Boolean)
    : audioQueueData
    ? audioQueueItems ?? []
    : null

  return {
    // Items without cached metadata (queued elsewhere, not seen locally yet)
    // are hidden rather than rendered broken — see `helpers/audioItemCache.ts`.
    audioQueue: resolvedQueue?.filter(
      (item) => item.document?.meta?.audioSource,
    ),
    audioQueueIsLoading: isLoading,
    audioQueueHasError: !me ? null : audioQueueHasError,
    refetchAudioQueue: !me ? () => null : refetchAudioQueue,
    addAudioQueueItem: handleAddQueueItem,
    removeAudioQueueItem: handleRemoveQueueItem,
    moveAudioQueueItem: handleMoveQueueItem,
    clearAudioQueue: handleClearQueue,
    reorderAudioQueue: handleQueueReorder,
    isAudioQueueAvailable:
      !inNativeApp || // in browser
      (inNativeApp && // in app with non legacy version
        compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) >= 0),
    checkIfHeadOfQueue,
    checkIfInQueue,
    getAudioQueueItemIndex,
  }
}

export default useAudioQueue

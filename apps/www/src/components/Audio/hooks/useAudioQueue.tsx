'use client'

import { getFragmentData } from '#graphql/cms/__generated__/gql'
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
import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { AudioQueueItem } from '@/components/Audio/types/AudioQueueItem'
import { useMe } from '@/lib/context/MeContext'
import { reportError } from '@/lib/errors/reportError'
import createPersistedState from '@/lib/hooks/use-persisted-state'
import compareVersion from '@/lib/react-native/CompareVersion'
import { useInNativeApp } from '@/lib/withInNativeApp'
import { ApolloCache, ApolloError, useMutation, useQuery } from '@apollo/client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { NEW_AUDIO_API_VERSION } from '../constants'

const usePersistedAudioState = createPersistedState<AudioQueueItem>(
  'audio-player-local-state',
)

const MAX_QUEUE_SIZE = 20

/**
 * The audio queue API stores refs (a `sanityId`, no content) — the same join
 * key `document-id.ts` produces for bookmarks. Recomputing it here from a ref
 * is what lets the cache be looked up by it.
 */
function refDocumentId(ref: AudioQueueItemRefFragment): string | null {
  return ref.sanityId ? `sanity:${ref.sanityId}` : null
}

/**
 * Fetches queue-item content from Sanity via a plain API route rather than
 * importing a server action: `useAudioQueue` is reachable from both the App
 * Router and the legacy Pages Router, and only App Router pages get the RSC
 * compilation that strips a server action's real implementation out of the
 * client bundle. A Pages Router page importing the `sanityFetch`-based
 * action directly would bundle `defineLive` itself into client JS, which
 * throws at runtime ("defineLive can't be imported by a client component").
 */
async function getAudioQueueItemsByIds(
  ids: string[],
): Promise<AudioQueueItemContent[]> {
  const response = await fetch('/api/sanity/audio-queue-items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch audio queue items: ${response.status}`)
  }
  return response.json()
}

/**
 * Join a ref with the Sanity content it points at. `mediaId` and
 * `userProgress` come from the server, which is authoritative for both.
 */
function mergeQueueItem(
  ref: AudioQueueItemRefFragment,
  knownItem: AudioQueueItemContent | undefined,
): AudioQueueItem {
  return {
    id: ref.id,
    sequence: ref.sequence,
    mediaId: ref.mediaId ?? refDocumentId(ref),
    userProgress: ref.userProgress,
    document: knownItem ?? null,
  }
}

const isPlayable = (item: AudioQueueItem | null): boolean =>
  !!item?.document?.audioSourceMp3

/**
 * useAudioQueue acts as a provider for the audio queue and all it's mutations.
 * Additionally, it provides the user-progress for all queued audio-items.
 *
 * For users with an active membership, the queue is synchronized with the server.
 * For users without an active membership, the queue is persisted in local storage.
 * The local storage however doesn't allow for more than one item to be saved.
 */
export type AudioQueueContextValue = {
  audioQueue: AudioQueueItem[]
  audioQueueIsLoading: boolean
  audioQueueHasError?: ApolloError | null
  refetchAudioQueue: () => Promise<unknown>
  addAudioQueueItem: (
    item: AudioQueueItemContent,
    position?: number,
  ) => Promise<AudioQueueItem[]>
  removeAudioQueueItem: (audioItemId: string) => Promise<void>
  clearAudioQueue: () => Promise<void>
  moveAudioQueueItem: (audioItemId: string, position: number) => Promise<void>
  reorderAudioQueue: (reorderedQueueItems: AudioQueueItem[]) => Promise<void>
  isAudioQueueAvailable: boolean
  checkIfHeadOfQueue: (documentId: string) => AudioQueueItem
  checkIfInQueue: (documentId: string) => AudioQueueItem
  getAudioQueueItemIndex: (documentId: string) => number
}

/**
 * The queue's actual implementation: one Apollo watch, one persisted-state
 * instance, one hydration effect. Only `AudioQueueProvider` may call it —
 * everything else goes through `useAudioQueue` below, so the cost is paid
 * once per app rather than once per component. A feed page mounts dozens of
 * consumers (one per teaser, see components/teaser/feed/teaser-actions.tsx).
 */
export const useAudioQueueState = (): AudioQueueContextValue => {
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
  // The queue API returns bare refs, so each item's content is fetched from
  // Sanity. Items are also remembered when a caller adds or plays one, so the
  // player can render before that fetch lands — the caller already holds the
  // same Sanity content, having rendered a teaser or article page from it.
  const [knownItems, setKnownItems] = useState<
    Map<string, AudioQueueItemContent>
  >(new Map())
  // A ref mirroring the state above. `handleAddQueueItem` remembers an item and
  // then, in the same call, maps the mutation's refs through `mergeQueueItem` —
  // a setState hasn't landed by then, so reading the state Map would always
  // miss the item just added and hand back `document: null`.
  const knownItemsRef = useRef(knownItems)

  const writeKnownItems = (
    update: (
      previous: Map<string, AudioQueueItemContent>,
    ) => Map<string, AudioQueueItemContent>,
  ) => {
    const next = update(knownItemsRef.current)
    knownItemsRef.current = next
    setKnownItems(next)
  }
  // Ids already fetched, so a queue change doesn't refetch them. A ref, not
  // state: updating it must not trigger a render of its own.
  const fetchedIds = useRef<Set<string>>(new Set())

  const rememberItem = (item: AudioQueueItemContent) => {
    if (!item?._id || !item.audioSourceMp3) return
    writeKnownItems((previous) =>
      new Map(previous).set(collectionsDocumentId(item), item),
    )
  }

  const [pendingFetches, setPendingFetches] = useState(0)

  const sanityIds = audioQueueRefs
    .filter((ref) => ref.sanityId)
    .map((ref) => ref.sanityId)

  useEffect(() => {
    const pending = sanityIds.filter((id) => !fetchedIds.current.has(id))
    if (pending.length === 0) return

    setPendingFetches((count) => count + 1)

    getAudioQueueItemsByIds(pending)
      .then((items) => {
        pending.forEach((id) => fetchedIds.current.add(id))
        if (items.length === 0) return

        writeKnownItems((previous) => {
          const next = new Map(previous)
          items.forEach((item) => next.set(collectionsDocumentId(item), item))
          return next
        })
      })
      // Failures stay unmarked, so the next queue change retries them.
      .catch((error) =>
        reportError('useAudioQueue: hydrate from Sanity', error),
      )
      .finally(() => setPendingFetches((count) => count - 1))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sanityIds.join(',')])

  // used for remove excess items, including invisible ones
  const allQueueItems = audioQueueRefs.map((ref) => {
    const documentId = refDocumentId(ref)
    return mergeQueueItem(
      ref,
      documentId ? knownItems.get(documentId) : undefined,
    )
  })
  const audioQueueItems = allQueueItems.filter(isPlayable)
  const isLoading = meLoading || audioQueueIsLoading || pendingFetches > 0

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

  const [addAudioQueueItemMutation] = useMutation(
    AddAudioQueueItemRefDocument,
    {
      update: modifyApolloCacheWithUpdatedPlaylist,
    },
  )
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
   * @param item the article's Sanity content, as the player renders it
   * @param position position in the queue. To push to front of queue, pass 1
   */
  const handleAddQueueItem = async (
    item: AudioQueueItemContent,
    position?: number,
  ): Promise<AudioQueueItem[]> => {
    rememberItem(item)
    const documentId = collectionsDocumentId(item)

    if (me) {
      // Enforce the queue limit by removing an item before adding.
      if (allQueueItems.length >= MAX_QUEUE_SIZE) {
        const evicted =
          allQueueItems.find((item) => !isPlayable(item)) ??
          audioQueueItems[audioQueueItems.length - 1]
        await removeAudioQueueItemMutation({ variables: { id: evicted.id } })
      }

      const { data } = await addAudioQueueItemMutation({
        variables: {
          entity: {
            id: documentId,
            type: AudioQueueEntityType.Document,
          },
          sequence: position,
        },
      })
      const refs = getFragmentData(
        AudioQueueItemRefFragmentDoc,
        data?.audioQueueItems || [],
      )
      // Filtered like every other queue this hook hands out.
      return refs
        .map((ref) =>
          mergeQueueItem(
            ref,
            knownItemsRef.current.get(refDocumentId(ref) ?? ''),
          ),
        )
        .filter(isPlayable)
    } else {
      const mockAudioQueueItem: AudioQueueItem = {
        id: uuid(),
        sequence: 0,
        mediaId: documentId,
        userProgress: null,
        document: item,
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

  /**
   * The join key a queue slot's content is addressed by, or null if unknown.
   * The `_id` check also covers a locally persisted item written by an older
   * build, which held the legacy document shape.
   */
  const itemDocumentId = (item: AudioQueueItem | null): string | null =>
    item?.document?._id ? collectionsDocumentId(item.document) : null

  function checkIfHeadOfQueue(documentId: string): AudioQueueItem {
    if (!me && itemDocumentId(localAudioItem) === documentId) {
      return localAudioItem
    }
    if (itemDocumentId(audioQueueItems[0]) === documentId) {
      return audioQueueItems[0]
    }
  }

  function checkIfInQueue(documentId: string): AudioQueueItem {
    if (!me && itemDocumentId(localAudioItem) === documentId) {
      return localAudioItem
    }
    return audioQueueItems.find(
      (audioQueueItem) => itemDocumentId(audioQueueItem) === documentId,
    )
  }

  function getAudioQueueItemIndex(documentId: string): number {
    if (!me && itemDocumentId(localAudioItem) === documentId) {
      return 0
    }
    return audioQueueItems.findIndex(
      (item) => itemDocumentId(item) === documentId,
    )
  }

  const resolvedQueue = !me
    ? [localAudioItem].filter(isPlayable)
    : audioQueueData
    ? audioQueueItems ?? []
    : null

  return {
    audioQueue: resolvedQueue,
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

export const AudioQueueContext = createContext<AudioQueueContextValue | null>(
  null,
)

/**
 * Availability is split off deliberately. It's a boolean derived from the
 * native-app version and membership, so it changes almost never — while the
 * queue value next to it changes on every mutation. Most consumers want only
 * this (see `useAddToPlaylistAllowed`, which a feed page calls once per
 * teaser); keeping them on their own context stops a queue change from
 * re-rendering all of them.
 */
export const AudioQueueAvailabilityContext = createContext<boolean | null>(null)

const useAudioQueueContext = <T,>(
  context: React.Context<T | null>,
  name: string,
): T => {
  const value = useContext(context)

  if (value === null) {
    throw new Error(`${name} must be used inside an AudioQueueProvider`)
  }

  return value
}

/** Whether the queue is usable at all. Cheap: see the context above. */
export const useIsAudioQueueAvailable = (): boolean =>
  useAudioQueueContext(
    AudioQueueAvailabilityContext,
    'useIsAudioQueueAvailable',
  )

/**
 * The full queue. Re-renders on every queue change — prefer
 * `useIsAudioQueueAvailable` if that's all you need.
 */
const useAudioQueue = (): AudioQueueContextValue =>
  useAudioQueueContext(AudioQueueContext, 'useAudioQueue')

export default useAudioQueue

import { useInNativeApp } from '../../../lib/withInNativeApp'
import compareVersion from '../../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from '../constants'
import {
  AddAudioQueueItemMutationData,
  AUDIO_QUEUE_QUERY,
  AudioQueueItem,
  ClearAudioQueueMutationData,
  MoveAudioQueueItemMutationData,
  RemoveAudioQueueItemMutationData,
  ReorderAudioQueueMutationData,
  useAddAudioQueueItemMutation,
  useAudioQueueQuery,
  useClearAudioQueueMutation,
  useMoveAudioQueueItemMutation,
  useRemoveAudioQueueItemMutation,
  useReorderAudioQueueMutation,
} from '../graphql/AudioQueueHooks'
import { useMe } from '../../../lib/context/MeContext'
import createPersistedState from '../../../lib/hooks/use-persisted-state'
import { AudioPlayerItem } from '../types/AudioPlayerItem'
import { ApolloError, FetchResult } from '@apollo/client'
import OptimisticQueueResponseHelper from '../helpers/OptimisticQueueResponseHelper'

const usePersistedAudioState = createPersistedState<AudioQueueItem>(
  'audio-player-local-state',
)

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
  ) => Promise<FetchResult<AddAudioQueueItemMutationData>>
  removeAudioQueueItem: (
    audioItemId: string,
  ) => Promise<FetchResult<RemoveAudioQueueItemMutationData>>
  clearAudioQueue: () => Promise<FetchResult<ClearAudioQueueMutationData>>
  moveAudioQueueItem: (
    audioItemId: string,
    position: number,
  ) => Promise<unknown>
  reorderAudioQueue: (
    reorderedQueueItems: AudioQueueItem[],
  ) => Promise<FetchResult<ReorderAudioQueueMutationData>>
  isAudioQueueAvailable: boolean
  checkIfHeadOfQueue: (documentId: string) => AudioQueueItem
  checkIfInQueue: (audioItemId: string) => AudioQueueItem
  getAudioQueueItemIndex: (documentId: string) => number
} => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  const { meLoading, hasAccess } = useMe()
  const {
    data: meWithAudioQueue,
    loading: audioQueueIsLoading,
    error: audioQueueHasError,
    refetch: refetchAudioQueue,
  } = useAudioQueueQuery({
    skip: meLoading || !hasAccess,
  })
  const isLoading = meLoading || audioQueueIsLoading

  const [localAudioItem, setLocalAudioItem] =
    usePersistedAudioState<AudioQueueItem>(null)

  /**
   *
   * @param cache
   * @param audioQueueItems
   */
  const modifyApolloCacheWithUpdatedPlaylist = (
    cache,
    { data: { audioQueueItems } },
  ) => {
    const { me } = cache.readQuery({ query: AUDIO_QUEUE_QUERY })
    cache.writeQuery({
      query: AUDIO_QUEUE_QUERY,
      data: {
        me: { ...me, audioQueue: audioQueueItems },
      },
    })
  }

  const [addAudioQueueItem] = useAddAudioQueueItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [removeAudioQueueItem] = useRemoveAudioQueueItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [moveAudioQueueItem] = useMoveAudioQueueItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [clearAudioQueue] = useClearAudioQueueMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [reorderAudioQueue] = useReorderAudioQueueMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })

  /**
   * Add an audio item to the queue or to the local storage if the user is not a member.
   * @param item partial of a document with all the required meta fields
   * @param position position in the queue. To push to front of queue, pass 1
   */
  const handleAddQueueItem = async (
    item: AudioPlayerItem,
    position?: number,
  ): Promise<FetchResult<AddAudioQueueItemMutationData>> => {
    if (hasAccess) {
      return addAudioQueueItem({
        variables: {
          entity: {
            id: item.id,
            type: 'Document',
          },
          sequence: position,
        },
      })
    } else {
      const mockAudioQueueItem = {
        id: item.id,
        document: item,
        sequence: 0,
      }
      setLocalAudioItem(mockAudioQueueItem)
      return Promise.resolve({
        data: {
          audioQueueItems: [mockAudioQueueItem],
        },
      })
    }
  }

  /**
   * Remove an item from the queue or from the local storage if the user is not a member.
   * @param audioItemId
   */
  const handleRemoveQueueItem = async (
    audioItemId: string,
  ): Promise<FetchResult<RemoveAudioQueueItemMutationData>> => {
    if (hasAccess) {
      const audioQueueItems = meWithAudioQueue?.me?.audioQueue || []
      return removeAudioQueueItem({
        variables: {
          id: audioItemId,
        },
        optimisticResponse: {
          audioQueueItems: audioQueueItems.filter(
            (item) => item.id !== audioItemId,
          ),
        },
      })
    } else {
      setLocalAudioItem(null)
      return Promise.resolve({
        data: {
          audioQueueItems: [],
        },
      })
    }
  }

  const handleMoveQueueItem = async (
    audioItemId: string,
    position: number,
  ): Promise<FetchResult<MoveAudioQueueItemMutationData>> => {
    if (hasAccess) {
      const audioQueueItems = meWithAudioQueue?.me?.audioQueue || []
      return moveAudioQueueItem({
        variables: {
          id: audioItemId,
          sequence: position,
        },
        optimisticResponse:
          OptimisticQueueResponseHelper.makeMoveQueueItemResponse(
            audioQueueItems,
            audioItemId,
            position,
          ),
      })
    } else {
      return Promise.resolve({
        data: {
          audioQueueItems: [localAudioItem].filter(Boolean),
        },
      })
    }
  }

  const handleClearQueue = async (): Promise<
    FetchResult<ClearAudioQueueMutationData>
  > => {
    if (hasAccess) {
      return clearAudioQueue({
        optimisticResponse: {
          audioQueueItems: [],
        },
      })
    } else {
      setLocalAudioItem(null)
      return Promise.resolve({
        data: {
          audioQueueItems: [],
        },
      })
    }
  }

  const handleQueueReorder = async (
    reorderedQueue: AudioQueueItem[],
  ): Promise<FetchResult<ReorderAudioQueueMutationData>> => {
    if (hasAccess) {
      return reorderAudioQueue({
        variables: {
          ids: reorderedQueue.map(({ id }) => id),
        },
        optimisticResponse: {
          audioQueueItems: reorderedQueue.map((item, index) => ({
            ...item,
            sequence: index + 1,
            __typename: 'AudioQueueItem',
          })),
        },
      })
    }
    return Promise.resolve({
      data: {
        audioQueueItems: [localAudioItem].filter(Boolean),
      },
    })
  }

  function checkIfHeadOfQueue(documentId: string): AudioQueueItem {
    if (!hasAccess && localAudioItem?.document?.id === documentId) {
      return localAudioItem
    }
    if (meWithAudioQueue?.me?.audioQueue?.[0]?.document?.id === documentId) {
      return meWithAudioQueue?.me?.audioQueue?.[0]
    }
  }

  function checkIfInQueue(documentId: string): AudioQueueItem {
    if (!hasAccess && localAudioItem?.document?.id === documentId) {
      return localAudioItem
    }
    return meWithAudioQueue?.me?.audioQueue.find(
      (audioQueueItem) => audioQueueItem.document.id === documentId,
    )
  }

  function getAudioQueueItemIndex(documentId: string): number {
    if (!hasAccess && localAudioItem?.document.id === documentId) {
      return 0
    }
    return meWithAudioQueue?.me?.audioQueue.findIndex(
      (item) => item.document.id === documentId,
    )
  }

  const resolvedQueue = !hasAccess
    ? [localAudioItem].filter(Boolean)
    : meWithAudioQueue
    ? meWithAudioQueue?.me?.audioQueue ?? []
    : null

  // In case faulty audio queue items are in the queue, remove them
  resolvedQueue
    ?.filter((item) => !item.document?.meta?.audioSource)
    .forEach((item) => handleRemoveQueueItem(item.id))

  return {
    audioQueue: resolvedQueue?.filter(
      (item) => item.document?.meta?.audioSource,
    ),
    audioQueueIsLoading: isLoading,
    audioQueueHasError: !hasAccess ? null : audioQueueHasError,
    refetchAudioQueue: !hasAccess ? () => null : refetchAudioQueue,
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

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
import { defaultJsFileExtensions } from 'next/dist/build/webpack/loaders/utils'
import { json } from 'express'

const usePersistedAudioState =
  createPersistedState<AudioQueueItem>('audioState')

/**
 * useAudioQueue provides all playlist-data as well as operations to manage the playlist.
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
  checkIfActiveItem: (documentId: string) => boolean
  checkIfInQueue: (audioItemId: string) => boolean
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

  const [localAudioItem, setLocalAudioItem] =
    usePersistedAudioState<AudioQueueItem>(null)

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
        id: 'local',
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

  const [removeAudioQueueItem] = useRemoveAudioQueueItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const handleRemoveQueueItem = async (
    audioItemId: string,
  ): Promise<FetchResult<RemoveAudioQueueItemMutationData>> => {
    if (hasAccess) {
      return removeAudioQueueItem({
        variables: {
          id: audioItemId,
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

  const [moveAudioQueueItem] = useMoveAudioQueueItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const handleMoveQueueItem = async (
    audioItemId: string,
    position: number,
  ): Promise<FetchResult<MoveAudioQueueItemMutationData>> => {
    if (hasAccess) {
      return moveAudioQueueItem({
        variables: {
          id: audioItemId,
          sequence: position,
        },
      })
    } else {
      return Promise.resolve({
        data: {
          audioQueueItems: [localAudioItem].filter(Boolean),
        },
      })
    }
  }

  const [clearAudioQueue] = useClearAudioQueueMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const handleClearQueue = async (): Promise<
    FetchResult<ClearAudioQueueMutationData>
  > => {
    if (hasAccess) {
      return clearAudioQueue()
    } else {
      setLocalAudioItem(null)
      return Promise.resolve({
        data: {
          audioQueueItems: [],
        },
      })
    }
  }

  const [reorderAudioQueue] = useReorderAudioQueueMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
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

  function checkIfActiveItem(documentId: string): boolean {
    if (!hasAccess) {
      return localAudioItem?.document?.id === documentId
    }
    return (
      meWithAudioQueue?.me?.audioQueue?.[0]?.document?.id === documentId ||
      false
    )
  }

  function checkIfInQueue(documentId: string): boolean {
    if (!hasAccess) {
      return localAudioItem?.document?.id === documentId
    }
    return meWithAudioQueue?.me?.audioQueue.some(
      (audioQueueItem) => audioQueueItem.document.id === documentId,
    )
  }

  const resolvedQueue = !hasAccess
    ? [localAudioItem].filter(Boolean)
    : meWithAudioQueue
    ? meWithAudioQueue?.me?.audioQueue ?? []
    : null

  return {
    audioQueue: resolvedQueue,
    audioQueueIsLoading: !hasAccess ? false : audioQueueIsLoading,
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
    checkIfActiveItem,
    checkIfInQueue,
  }
}

export default useAudioQueue

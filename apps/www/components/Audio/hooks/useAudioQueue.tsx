import { useInNativeApp } from '../../../lib/withInNativeApp'
import compareVersion from '../../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from '../constants'
import { useMe } from '../../../lib/context/MeContext'
import createPersistedState from '../../../lib/hooks/use-persisted-state'
import { AudioPlayerItem, AudioQueueItem } from '../types/AudioPlayerItem'
import { ApolloError, FetchResult, useMutation, useQuery } from '@apollo/client'
import OptimisticQueueResponseHelper from '../helpers/OptimisticQueueResponseHelper'
import { reportError } from 'lib/errors/reportError'
import { useEffect } from 'react'
import {
  AddAudioQueueItemsDocument,
  AddAudioQueueItemsMutation,
  AudioQueueEntityType,
  AudioQueueItemFragmentDoc,
  AudioQueueQueryDocument,
  ClearAudioQueueDocument,
  ClearAudioQueueMutation,
  MoveAudioQueueItemDocument,
  MoveAudioQueueItemMutation,
  RemoveAudioQueueItemDocument,
  RemoveAudioQueueItemMutation,
  ReorderAudioQueueDocument,
  ReorderAudioQueueMutation,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { getFragmentData } from '#graphql/cms/__generated__/gql'

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
  ) => Promise<FetchResult<AddAudioQueueItemsMutation>>
  removeAudioQueueItem: (
    audioItemId: string,
  ) => Promise<FetchResult<RemoveAudioQueueItemMutation>>
  clearAudioQueue: () => Promise<FetchResult<ClearAudioQueueMutation>>
  moveAudioQueueItem: (
    audioItemId: string,
    position: number,
  ) => Promise<unknown>
  reorderAudioQueue: (
    reorderedQueueItems: AudioQueueItem[],
  ) => Promise<FetchResult<ReorderAudioQueueMutation>>
  isAudioQueueAvailable: boolean
  checkIfHeadOfQueue: (documentId: string) => AudioQueueItem
  checkIfInQueue: (audioItemId: string) => AudioQueueItem
  getAudioQueueItemIndex: (documentId: string) => number
} => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  const { meLoading, me } = useMe()
  const {
    data: meWithAudioQueue,
    loading: audioQueueIsLoading,
    error: audioQueueHasError,
    refetch: refetchAudioQueue,
  } = useQuery(AudioQueueQueryDocument, {
    skip: meLoading || !me,
    errorPolicy: 'all',
  })
  const audioQueueItems = getFragmentData(
    AudioQueueItemFragmentDoc,
    meWithAudioQueue?.me?.audioQueue || [],
  )
  const isLoading = meLoading || audioQueueIsLoading

  const [localAudioItem, setLocalAudioItem] =
    usePersistedAudioState<AudioQueueItem>(null)

  useEffect(() => {
    if (audioQueueHasError) {
      reportError('useAudioQueue', audioQueueHasError)
    }
  }, [audioQueueHasError])

  /**
   *
   * @param cache
   * @param audioQueueItems
   */
  const modifyApolloCacheWithUpdatedPlaylist = (
    cache,
    { data: { audioQueueItems } },
  ) => {
    const { me } = cache.readQuery({ query: AudioQueueQueryDocument })
    cache.writeQuery({
      query: AudioQueueQueryDocument,
      data: {
        me: { ...me, audioQueue: audioQueueItems },
      },
    })
  }

  const [addAudioQueueItem] = useMutation(AddAudioQueueItemsDocument, {
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [removeAudioQueueItem] = useMutation(RemoveAudioQueueItemDocument, {
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [moveAudioQueueItem] = useMutation(MoveAudioQueueItemDocument, {
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [clearAudioQueue] = useMutation(ClearAudioQueueDocument, {
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [reorderAudioQueue] = useMutation(ReorderAudioQueueDocument, {
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
  ): Promise<FetchResult<AddAudioQueueItemsMutation>> => {
    if (me) {
      return addAudioQueueItem({
        variables: {
          entity: {
            id: item.id,
            type: AudioQueueEntityType.Document,
          },
          sequence: position,
        },
      })
    } else {
      const mockAudioQueueItem: AudioQueueItem = {
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
  ): Promise<FetchResult<RemoveAudioQueueItemMutation>> => {
    if (me) {
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
  ): Promise<FetchResult<MoveAudioQueueItemMutation>> => {
    if (me) {
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
    FetchResult<ClearAudioQueueMutation>
  > => {
    if (me) {
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
  ): Promise<FetchResult<ReorderAudioQueueMutation>> => {
    if (me) {
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
    : meWithAudioQueue
    ? audioQueueItems ?? []
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

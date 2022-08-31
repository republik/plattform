import { useInNativeApp } from '../../../lib/withInNativeApp'
import compareVersion from '../../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from '../constants'
import {
  AUDIO_QUEUE_QUERY,
  useAddAudioQueueItemMutation,
  useAudioQueueQuery,
  useClearAudioQueueMutation,
  useMoveAudioQueueItemMutation,
  useRemoveAudioQueueItemMutation,
} from '../graphql/AudioQueueHooks'

/**
 * useAudioQueue provides all playlist-data as well as operations to manage the playlist.
 */
const useAudioQueue = () => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  const {
    data: meWithAudioQueue,
    loading: audioQueueIsLoading,
    error: audioQueueHasError,
  } = useAudioQueueQuery()

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

  function checkIfInQueue(documentId: string): boolean {
    return meWithAudioQueue?.me?.audioQueue.some(
      (audioQueueItem) => audioQueueItem.document.id === documentId,
    )
  }

  return {
    audioQueue: meWithAudioQueue
      ? meWithAudioQueue?.me?.audioQueue ?? []
      : null,
    audioQueueIsLoading,
    audioQueueHasError,
    addAudioQueueItem,
    removeAudioQueueItem,
    moveAudioQueueItem,
    clearAudioQueue,
    isAudioQueueAvailable:
      !inNativeApp || // in browser
      (inNativeApp && // in app with non legacy version
        compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) >= 0),
    checkIfInQueue,
  }
}

export default useAudioQueue

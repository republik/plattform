import { usePlaylistQuery, PlaylistQuery } from './usePlaylistQuery'
import { useAddPlaylistItemMutation } from './useAddPlaylistItemMutation'
import { useRemovePlaylistItemMutation } from './useRemovePlaylistItemMutation'
import { useMovePlaylistItemMutation } from './useMovePlaylistItemMutation'
import { useClearPlaylistMutation } from './useClearPlaylistMutation'
import { useInNativeApp } from '../../../lib/withInNativeApp'
import compareVersion from '../../../lib/react-native/CompareVersion'
import { NEW_AUDIO_API_VERSION } from '../constants'

/**
 * usePlaylist provides all playlist-data as well as operations to manage the playlist.
 */
const usePlaylist = () => {
  const { inNativeApp, inNativeAppVersion } = useInNativeApp()
  const {
    data: meWithPlaylist,
    loading: playlistIsLoading,
    error: playlistHasError,
  } = usePlaylistQuery()

  const modifyApolloCacheWithUpdatedPlaylist = (
    cache,
    { data: { playlistItems } },
  ) => {
    const { me } = cache.readQuery({ query: PlaylistQuery })
    cache.writeQuery({
      query: PlaylistQuery,
      data: {
        me: { ...me, collectionPlaylist: playlistItems },
      },
    })
  }

  const [addPlaylistItem] = useAddPlaylistItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [removePlaylistItem] = useRemovePlaylistItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [movePlaylistItem] = useMovePlaylistItemMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })
  const [clearPlaylist] = useClearPlaylistMutation({
    update: modifyApolloCacheWithUpdatedPlaylist,
  })

  return {
    playlist: meWithPlaylist
      ? meWithPlaylist?.me?.collectionPlaylist ?? []
      : null,
    playlistIsLoading,
    playlistHasError,
    addPlaylistItem,
    removePlaylistItem,
    movePlaylistItem,
    clearPlaylist,
    isPlaylistAvailable:
      !inNativeApp || // in browser
      (inNativeApp && // in app with non legacy version
        compareVersion(inNativeAppVersion, NEW_AUDIO_API_VERSION) >= 0),
  }
}

export default usePlaylist

import { usePlaylistQuery, PlaylistQuery } from './usePlaylistQuery'
import { useAddPlaylistItemMutation } from './useAddPlaylistItemMutation'
import { useRemovePlaylistItemMutation } from './useRemovePlaylistItemMutation'
import { useMovePlaylistItemMutation } from './useMovePlaylistItemMutation'
import { useClearPlaylistMutation } from './useClearPlaylistMutation'
import { some } from 'lodash'
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
  const [addPlaylistItem] = useAddPlaylistItemMutation({
    refetchQueries: [{ query: PlaylistQuery }],
  })
  const [removePlaylistItem] = useRemovePlaylistItemMutation({
    refetchQueries: [{ query: PlaylistQuery }],
  })
  const [movePlaylistItem] = useMovePlaylistItemMutation({
    refetchQueries: [{ query: PlaylistQuery }],
  })
  const [clearPlaylist] = useClearPlaylistMutation({
    refetchQueries: [{ query: PlaylistQuery }],
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

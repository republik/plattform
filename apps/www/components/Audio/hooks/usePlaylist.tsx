import { usePlaylistQuery, PlaylistQuery } from './usePlaylistQuery'
import { useAddPlaylistItemMutation } from './useAddPlaylistItemMutation'
import { useRemovePlaylistItemMutation } from './useRemovePlaylistItemMutation'
import { useMovePlaylistItemMutation } from './useMovePlaylistItemMutation'
import { useClearPlaylistMutation } from './useClearPlaylistMutation'

/**
 * usePlaylist provides all playlist-data as well as operations to manage the playlist.
 */
const usePlaylist = () => {
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
    playlist: meWithPlaylist.me?.collectionPlaylist ?? [],
    playlistIsLoading,
    playlistHasError,
    addPlaylistItem,
    removePlaylistItem,
    movePlaylistItem,
    clearPlaylist,
  }
}

export default usePlaylist

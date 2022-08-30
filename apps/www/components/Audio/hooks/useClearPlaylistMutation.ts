import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'

type ClearPlaylistMutationData = {
  playlistItems: PlaylistItemFragment[]
}

const ClearPlaylistMutation = gql`
  mutation ClearPlaylist {
  playlistItems: clearPlaylist {
    ...PlaylistFragment
  }
  ${PlaylistItemGQLFragment}
}
`

export const useClearPlaylistMutation =
  makeMutationHook<ClearPlaylistMutationData>(ClearPlaylistMutation)

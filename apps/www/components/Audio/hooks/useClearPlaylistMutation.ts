import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'

type ClearPlaylistMutationData = PlaylistItemFragment[]

const ClearPlaylistMutation = gql`
  mutation ClearPlaylist() {
  clearPlaylist() {
    ...PlaylistFragment
  }
  ${PlaylistItemGQLFragment}
}
`

export const useClearPlaylistMutation =
  makeMutationHook<ClearPlaylistMutationData>(ClearPlaylistMutation)

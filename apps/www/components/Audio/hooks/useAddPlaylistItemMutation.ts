import { gql } from '@apollo/client'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

type AddPlaylistItemMutationData = {
  playlistItems: PlaylistItemFragment[]
}

type AddPlaylistItemMutationVariables = {
  item: {
    // DocumentId
    id: string
    // PlaylistItem enum value
    type: 'Document'
  }
  sequence?: number
}

const UseAddPlaylistItemMutation = gql`
  mutation AddPlaylistItem($item: PlaylistItemInput!, $sequence: Int) {
    playlistItems: addPlaylistItem(item: $item, sequence: $sequence) {
      ...PlaylistItemFragment
    }
  }
  ${PlaylistItemGQLFragment}
`

export const useAddPlaylistItemMutation = makeMutationHook<
  AddPlaylistItemMutationData,
  AddPlaylistItemMutationVariables
>(UseAddPlaylistItemMutation)

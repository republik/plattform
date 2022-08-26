import { gql } from '@apollo/client'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

type AddPlaylistItemMutationData = PlaylistItemFragment[]

type AddPlaylistItemMutationVariables = {
  item: {
    id: string
    type: unknown
  }
  sequence?: number
}

const UseAddPlaylistItemMutation = gql`
  mutation AddPlaylistItem($item: PlaylistItemInput!, $sequence: Int) {
    addPlaylistItem(item: $item, sequence: $sequence) {
      ...PlaylistItemFragment
    }
  }
  ${PlaylistItemGQLFragment}
`

export const useAddPlaylistItemMutation = makeMutationHook<
  AddPlaylistItemMutationData,
  AddPlaylistItemMutationVariables
>(UseAddPlaylistItemMutation)

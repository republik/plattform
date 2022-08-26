import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { gql } from '@apollo/client'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'

type RemovePlaylistItemMutationData = PlaylistItemFragment[]

type RemovePlaylistItemMutationVariables = {
  id: string
  sequence: number
}

const RemovePlaylistItemMutation = gql`
  mutation RemovePlaylistItem($id: ID!) {
    removePlaylistItem(id: $id) {
      ...PlaylistItemFragment
    }
  }
  ${PlaylistItemGQLFragment}
`

export const useRemovePlaylistItemMutation = makeMutationHook<
  RemovePlaylistItemMutationData,
  RemovePlaylistItemMutationVariables
>(RemovePlaylistItemMutation)

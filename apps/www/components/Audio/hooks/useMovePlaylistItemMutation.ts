import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { gql } from '@apollo/client'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'

type MovePlaylistItemMutationData = {
  playlistItems: PlaylistItemFragment[]
}

type MovePlaylistItemMutationVariables = {
  id: string
  sequence: number
}

const MovePlaylistItemMutation = gql`
  mutation MovePlaylistItem($id: ID!, $sequence: Int!) {
    playlistItems: movePlaylistItem(id: $id, sequence: $sequence) {
      ...PlaylistItemFragment
    }
  }
  ${PlaylistItemGQLFragment}
`

export const useMovePlaylistItemMutation = makeMutationHook<
  MovePlaylistItemMutationData,
  MovePlaylistItemMutationVariables
>(MovePlaylistItemMutation)

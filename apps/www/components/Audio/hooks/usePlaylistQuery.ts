import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  PlaylistItemFragment,
  PlaylistItemGQLFragment,
} from '../graphql/PlaylistItemGQLFragment'

type PlaylistQueryData = {
  me?: {
    collectionPlaylist?: PlaylistItemFragment[]
  }
}

export const PlaylistQuery = gql`
  query GetPlayList {
    me {
      collectionPlaylist {
        ...PlaylistItemFragment
      }
    }
  }
  ${PlaylistItemGQLFragment}
`

export const usePlaylistQuery = makeQueryHook<PlaylistQueryData>(PlaylistQuery)

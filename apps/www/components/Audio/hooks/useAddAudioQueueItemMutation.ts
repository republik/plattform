import { gql } from '@apollo/client'
import {
  AudioQueueItem,
  AudioQueueItemFragment,
} from '../graphql/AudioQueueItemFragment'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

type AddAudioQueueItemMutationData = {
  audioQueueItems: AudioQueueItem[]
}

type AddAudioQueueItemMutationVariables = {
  entity: {
    // DocumentId
    id: string
    // PlaylistItem enum value
    type: 'Document'
  }
  sequence?: number
}

const ADD_AUDIO_QUEUE_ITEM_MUTATION = gql`
  mutation AddPlaylistItem($entity: AudioQueueEntityInput!, $sequence: Int) {
    audioQueueItems: addAudioQueueItem(entity: $entity, sequence: $sequence) {
      ...AudioQueueItemFragment
    }
  }
  ${AudioQueueItemFragment}
`

export const useAddAudioQueueItemMutation = makeMutationHook<
  AddAudioQueueItemMutationData,
  AddAudioQueueItemMutationVariables
>(ADD_AUDIO_QUEUE_ITEM_MUTATION)

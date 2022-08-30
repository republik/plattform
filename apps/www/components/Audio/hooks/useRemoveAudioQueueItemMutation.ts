import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { gql } from '@apollo/client'
import {
  AudioQueueItem,
  AudioQueueItemFragment,
} from '../graphql/AudioQueueItemFragment'

type RemoveAudioQueueItemMutationData = {
  audioQueueItems: AudioQueueItem[]
}

type RemoveAudioQueueItemMutationVariables = {
  id: string
}

const REMOVE_AUDIO_QUEUE_ITEM_MUTATION = gql`
  mutation RemoveAudioQueueItem($id: ID!) {
    audioQueueItems: removeAudioQueueItem(id: $id) {
      ...AudioQueueItemFragment
    }
  }
  ${AudioQueueItemFragment}
`

export const useRemoveAudioQueueItemMutation = makeMutationHook<
  RemoveAudioQueueItemMutationData,
  RemoveAudioQueueItemMutationVariables
>(REMOVE_AUDIO_QUEUE_ITEM_MUTATION)

import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { gql } from '@apollo/client'
import {
  AudioQueueItem,
  AudioQueueItemFragment,
} from '../graphql/AudioQueueItemFragment'

type MoveAudioQueueItemMutationData = {
  audioQueueItems: AudioQueueItem[]
}

type MoveAudioQueueItemMutationVariables = {
  id: string
  sequence: number
}

const MOVE_AUDIO_QUEUE_ITEM_MUTATION = gql`
  mutation MoveAudioQueueItem($id: ID!, $sequence: Int!) {
    audioQueueItems: moveAudioQueueItem(id: $id, sequence: $sequence) {
      ...AudioQueueItemFragment
    }
  }
  ${AudioQueueItemFragment}
`

export const useMoveAudioQueueItemMutation = makeMutationHook<
  MoveAudioQueueItemMutationData,
  MoveAudioQueueItemMutationVariables
>(MOVE_AUDIO_QUEUE_ITEM_MUTATION)

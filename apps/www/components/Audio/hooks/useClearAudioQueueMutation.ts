import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  AudioQueueItem,
  AudioQueueItemFragment,
} from '../graphql/AudioQueueItemFragment'

type ClearAudioQueueMutationData = {
  audioQueueItems: AudioQueueItem[]
}

const ClearPlaylistMutation = gql`
  mutation ClearAudioQueue {
    audioQueueItems: clearAudioQueue {
      ...AudioQueueItemFragment
    }
    ${AudioQueueItemFragment}
  }
`

export const useClearAudioQueueMutation =
  makeMutationHook<ClearAudioQueueMutationData>(ClearPlaylistMutation)

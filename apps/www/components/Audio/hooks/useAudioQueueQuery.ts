import { gql } from '@apollo/client'
import { makeQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import {
  AudioQueueItem,
  AudioQueueItemFragment,
} from '../graphql/AudioQueueItemFragment'

type AudiQueueQueryData = {
  me?: {
    audioQueue?: AudioQueueItem[]
  }
}

export const AUDIO_QUEUE_QUERY = gql`
  query GetAudioQueue {
    me {
      audioQueue {
        ...AudioQueueItemFragment
      }
    }
  }
  ${AudioQueueItemFragment}
`

export const useAudioQueueQuery =
  makeQueryHook<AudiQueueQueryData>(AUDIO_QUEUE_QUERY)

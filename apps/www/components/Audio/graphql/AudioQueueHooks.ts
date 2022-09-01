import { gql } from '@apollo/client'
import {
  makeMutationHook,
  makeQueryHook,
} from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { AudioPlayerItem } from '../types/AudioPlayerItem'

export type AudioQueueItem = {
  id: string
  sequence: number
  document: AudioPlayerItem
}

const AudioQueueItemFragment = gql`
  fragment AudioQueueItemFragment on AudioQueueItem {
    id
    sequence
    document {
      id
      meta {
        title
        path
        publishDate
        image
        audioSource {
          mediaId
          kind
          mp3
          aac
          ogg
          durationMs
          userProgress {
            id
            secs
          }
        }
      }
    }
  }
`

// Read AudioQueue

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

// Add AudioQueueItem

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

// Move AudioQueueItem

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

// Remove AudioQueueItem

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

// ClearAudioQueue

type ClearAudioQueueMutationData = {
  audioQueueItems: AudioQueueItem[]
}

const CLEAR_AUDIO_QUEUE = gql`
  mutation ClearAudioQueue {
    audioQueueItems: clearAudioQueue {
      ...AudioQueueItemFragment
    }
    ${AudioQueueItemFragment}
  }
`

export const useClearAudioQueueMutation =
  makeMutationHook<ClearAudioQueueMutationData>(CLEAR_AUDIO_QUEUE)

const REORDER_AUDIO_QUEUE_MUTATION = gql`
  mutation ReorderAudioQueue($ids: [ID!]!) {
    audioQueueItems: reorderAudioQueue(ids: $ids) {
      ...AudioQueueItemFragment
    }
  }
  ${AudioQueueItemFragment}
`

type ReorderAudioQueueMutationData = {
  audioQueueItems: AudioQueueItem[]
}

type ReorderAudioQueueMutationVariables = {
  ids: string[]
}

export const useReorderAudioQueueMutation = makeMutationHook<
  ReorderAudioQueueMutationData,
  ReorderAudioQueueMutationVariables
>(REORDER_AUDIO_QUEUE_MUTATION)

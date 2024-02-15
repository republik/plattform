import { gql } from '@apollo/client'
import {
  makeMutationHook,
  makeQueryHook,
} from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { AudioPlayerItem } from '../types/AudioPlayerItem'

export type AudioQueueItem = {
  id: string
  sequence: number
  document?: AudioPlayerItem
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
        audioCoverCrop {
          x
          y
          width
          height
        }
        coverForNativeApp: audioCover(properties: { width: 1024, height: 1024 })
        coverMd: audioCover(properties: { width: 256, height: 256 })
        coverSm: audioCover(properties: { width: 128, height: 128 })
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
        format {
          id
          meta {
            title
            color
            shareLogo
            shareBackgroundImage
            shareBackgroundImageInverted
          }
        }
      }
    }
  }
`

// Read AudioQueue

export type AudiQueueQueryData = {
  me?: {
    audioQueue?: AudioQueueItem[]
  }
}

export const AUDIO_QUEUE_QUERY = gql`
  query GetAudioQueue {
    me {
      id
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

export type AddAudioQueueItemMutationData = {
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

export type MoveAudioQueueItemMutationData = {
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

export type RemoveAudioQueueItemMutationData = {
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

export type ClearAudioQueueMutationData = {
  audioQueueItems: AudioQueueItem[]
}

const CLEAR_AUDIO_QUEUE = gql`
  mutation ClearAudioQueue {
    audioQueueItems: clearAudioQueue {
      id
    }
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

export type ReorderAudioQueueMutationData = {
  audioQueueItems: AudioQueueItem[]
}

type ReorderAudioQueueMutationVariables = {
  ids: string[]
}

export const useReorderAudioQueueMutation = makeMutationHook<
  ReorderAudioQueueMutationData,
  ReorderAudioQueueMutationVariables
>(REORDER_AUDIO_QUEUE_MUTATION)

import { gql } from '@apollo/client'
import { AudioPlayerItem } from '../types/AudioPlayerItem'

export type AudioQueueItem = {
  id: string
  sequence: number
  document: AudioPlayerItem
}

export const AudioQueueItemFragment = gql`
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

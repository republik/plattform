import { gql } from '@apollo/client'
import { AudioPlayerItem } from '../types/AudioPlayerItem'

export type PlaylistItemFragment = {
  id: string
  sequence: number
  document: AudioPlayerItem
}

export const PlaylistItemGQLFragment = gql`
  fragment PlaylistItemFragment on PlaylistItem {
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

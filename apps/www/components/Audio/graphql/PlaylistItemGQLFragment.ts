import { gql } from '@apollo/client'

export type PlaylistItemFragment = {
  id: string
  sequence: number
  document?: {
    meta?: {
      title: string
      path: string
      audioSource?: {
        mediaId: string
        kind: string
        mp3: string
        aac: string
        ogg: string
        durationMs: number
        userProgress?: {
          id: string
          secs: number
        }
      }
    }
  }
}

export const PlaylistItemGQLFragment = gql`
  fragment PlaylistItemFragment on PlaylistItem {
    id
    sequence
    document {
      meta {
        title
        path
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

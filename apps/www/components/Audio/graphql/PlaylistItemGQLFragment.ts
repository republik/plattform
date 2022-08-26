import { gql } from '@apollo/client'

export type PlaylistItemFragment = {
  id: string
  sequence: number
  document?: {
    id: string
    meta?: {
      title: string
      path: string
      publishDate?: string
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
      id
      meta {
        title
        path
        publishDate
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

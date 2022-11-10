import { gql } from '@apollo/client'

export const GET_DOCUMENT_AUDIO = gql`
  query getDocumentAudio($path: String!) {
    document(path: $path) {
      id
      meta {
        title
        path
        publishDate
        image
        audioSource {
          mp3
          aac
          ogg
          mediaId
          durationMs
          kind
        }
      }
    }
  }
`

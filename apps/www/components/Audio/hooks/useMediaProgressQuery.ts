import { MediaProgress } from '../types/MediaProgress'
import { gql } from '@apollo/client'
import { makeLazyQueryHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'

const MEDIA_PROGRESS_QUERY = gql`
  query mediaProgress($mediaId: ID!) {
    mediaProgress(mediaId: $mediaId) {
      id
      mediaId
      secs
    }
  }
`

export type MediaProgressVariables = {
  mediaId: string
}

export type MediaProgressData = {
  mediaProgress: Pick<MediaProgress, 'id' | 'mediaId' | 'secs'>
}

export const useMediaProgressLazyQuery = makeLazyQueryHook<
  MediaProgressData,
  MediaProgressVariables
>(MEDIA_PROGRESS_QUERY)

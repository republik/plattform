import { gql } from '@apollo/client'
import { makeMutationHook } from '../../../lib/helpers/AbstractApolloGQLHooks.helper'
import { MediaProgress } from './../types/MediaProgress'

const UPSERT_MEDIA_PROGRESS_MUTATION = gql`
  mutation upsertMediaProgress($mediaId: ID!, $secs: Float!) {
    upsertMediaProgress(mediaId: $mediaId, secs: $secs) {
      id
      mediaId
      secs
    }
  }
`

export type UpsertMediaProgressVariables = {
  mediaId: string
  secs: number
}

export type UpserMediaProgressData = {
  upsetMediaProgress: Pick<MediaProgress, 'id' | 'mediaId' | 'secs'>
}

const useUpsertMediaProgress = makeMutationHook<
  UpserMediaProgressData,
  UpsertMediaProgressVariables
>(UPSERT_MEDIA_PROGRESS_MUTATION)

export default useUpsertMediaProgress

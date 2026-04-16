import { Context, useContext } from 'react'
import { ApolloError } from '@apollo/client'
import { DiscussionContext } from '@project-r/styleguide'
import { DiscussionQuery } from '../graphql/queries/DiscussionQuery.graphql'
import { FetchDiscussionFunctionType } from '../hooks/useDiscussionData'
import { OverlayState } from '../hooks/overlays/useOverlay'
import { ShareOverlayState } from '../hooks/overlays/useShareCommentOverlay'
import { DiscussionCredential } from '../graphql/types/SharedTypes'
import { CommentFragmentType } from '../graphql/fragments/CommentFragment.graphql'

export interface DiscussionContextValue {
  id: string
  discussion: DiscussionQuery['discussion'] | undefined
  loading: boolean
  error: ApolloError | undefined
  fetchMore: FetchDiscussionFunctionType
  refetch: FetchDiscussionFunctionType
  focusId: string | undefined
  orderBy: string
  activeTag: string | undefined
  depth: number
  overlays: {
    shareOverlay: ShareOverlayState
    preferencesOverlay: OverlayState<DiscussionCredential>
    featureOverlay: OverlayState<CommentFragmentType>
  }
}
/*
export const DiscussionContext = createContext<DiscussionContextValue>(
  {} as DiscussionContextValue
)
 */

// TODO: Once the dialog-components no longer use the discussion context directly
// replace it with the above commented out code
export default DiscussionContext

export const useDiscussion = (): DiscussionContextValue => {
  return useContext(DiscussionContext as Context<DiscussionContextValue>)
}

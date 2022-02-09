import { gql } from '@apollo/client'
import {
  COMMENT_FRAGMENT,
  CommentFragmentType,
} from '../fragments/CommentFragment.graphql'
import Optional from '../../../../lib/types/Optional'
import { makeMutationHook } from '../../../../lib/helpers/AbstractApolloGQLHooks.helper'

type FeatureTarget = 'DEFAULT' | 'MARKETING'

export type FeatureCommentMutationVariables = {
  commentId: string
  content: Optional<string>
  targets: FeatureTarget[]
}

export type FeatureCommentMutationResult = {
  featureComment: CommentFragmentType
}

export const FEATURE_COMMENT_MUTATION = gql`
  mutation featureCommentMutation(
    $commentId: ID!
    $content: String
    $targets: [CommentFeaturedTarget!]
  ) {
    featureComment(id: $commentId, content: $content, targets: $targets) {
      ...Comment
    }
  }
  ${COMMENT_FRAGMENT}
`

export const useFeatureCommentMutation = makeMutationHook<
  FeatureCommentMutationVariables,
  FeatureCommentMutationResult
>(FEATURE_COMMENT_MUTATION)

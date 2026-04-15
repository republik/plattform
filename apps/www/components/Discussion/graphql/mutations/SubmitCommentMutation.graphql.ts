import { gql } from '@apollo/client'
import {
  COMMENT_FRAGMENT,
  CommentFragmentType,
} from '../fragments/CommentFragment.graphql'
import Optional from '../../../../lib/types/Optional'
import Nullable from '../../../../lib/types/Nullable'
import { DateTime, DiscussionNotificationOption } from '../types/SharedTypes'
import { makeMutationHook } from '../../../../lib/helpers/AbstractApolloGQLHooks.helper'

export type SubmitCommentMutationVariables = {
  discussionId: string
  parentId: Optional<string>
  id: Optional<string>
  content: string
  tags: string[]
}

export type SubmitCommentMutationResult = {
  submitComment: CommentFragmentType & {
    discussion: {
      id: string
      userPreference: Nullable<{
        notifications: Nullable<DiscussionNotificationOption>
      }>
      userWaitUntil: Nullable<DateTime>
    }
  }
}

export const SUBMIT_COMMENT_MUTATION = gql`
  mutation submitComment(
    $discussionId: ID!
    $parentId: ID
    $id: ID!
    $content: String!
    $tags: [String!]!
  ) {
    submitComment(
      id: $id
      discussionId: $discussionId
      parentId: $parentId
      content: $content
      tags: $tags
    ) {
      ...Comment
      discussion {
        id
        userPreference {
          notifications
        }
        userWaitUntil
      }
    }
  }
  ${COMMENT_FRAGMENT}
`

export const useSubmitCommentMutation = makeMutationHook<
  SubmitCommentMutationResult,
  SubmitCommentMutationVariables
>(SUBMIT_COMMENT_MUTATION)

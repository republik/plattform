import { FetchResult } from '@apollo/client'
import { v4 as uuid } from 'uuid'
import { toRejectedString } from '../../graphql/utils'
import Optional from '../../../../lib/types/Optional'
import {
  SubmitCommentMutationResult,
  useSubmitCommentMutation,
} from '../../graphql/mutations/SubmitCommentMutation.graphql'
import { useDiscussion } from '../../context/DiscussionContext'
import {
  DISCUSSION_QUERY,
  DiscussionQuery,
  DiscussionQueryVariables,
} from '../../graphql/queries/DiscussionQuery.graphql'
import produce from 'immer'
import { mergeComment } from '../../graphql/store'

export type SubmitCommentHandlerFunction = (
  content: string,
  tags: string[],
  options: {
    discussionId: string
    parentId: Optional<string>
  },
) => Promise<FetchResult<SubmitCommentMutationResult>>

function useSubmitCommentHandler(): SubmitCommentHandlerFunction {
  const [submitCommentMutation] = useSubmitCommentMutation()

  const { orderBy, focusId, activeTag, depth, discussion } = useDiscussion()

  return async (
    content: string,
    tags: string[],
    {
      discussionId,
      parentId,
    }: {
      discussionId: string
      parentId: Optional<string>
    },
  ) => {
    const id = uuid()

    return submitCommentMutation({
      variables: {
        id,
        content,
        discussionId,
        parentId,
        tags,
      },
      // Write the result of the query into the DiscussionQuery cache
      update: (cache, { data: { submitComment: comment } }) => {
        const variables: DiscussionQueryVariables = {
          discussionPath: discussion?.path,
          orderBy: orderBy,
          depth: depth,
          focusId: focusId,
          activeTag: activeTag,
        }

        const readQueries = cache.readQuery<
          DiscussionQuery,
          DiscussionQueryVariables
        >({ query: DISCUSSION_QUERY, variables })

        cache.writeQuery<DiscussionQuery, DiscussionQueryVariables>({
          query: DISCUSSION_QUERY,
          variables,
          data: produce(
            readQueries,
            mergeComment({
              comment,
              activeTag: activeTag,
              initialParentId: parentId,
            }),
          ),
        })
      },
    }).catch(toRejectedString)
  }
}

export default useSubmitCommentHandler

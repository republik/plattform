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
        try {
          cache.updateQuery<DiscussionQuery, DiscussionQueryVariables>(
            {
              query: DISCUSSION_QUERY,
              variables: {
                discussionPath: discussion?.path,
                orderBy: orderBy,
                depth: depth,
                focusId: focusId,
                activeTag: activeTag,
              },
            },
            (data) => {
              // If no cached query data exists, don't do anything.
              if (!data) {
                return
              }
              return produce(
                data,
                mergeComment({
                  comment,
                  activeTag: activeTag,
                  initialParentId: parentId,
                }),
              )
            },
          )
        } catch (e) {
          // If the cache update fails, the mutation still succeeded, so we don't have to do anything else.
          console.warn(
            "Couldn't update client cache after comment submit mutation",
            e,
          )
        }
      },
    }).catch(toRejectedString)
  }
}

export default useSubmitCommentHandler

import { useEffect } from 'react'
import { ApolloError, ApolloQueryResult } from '@apollo/client'
import { COMMENT_SUBSCRIPTION } from '../graphql/documents'
import produce from '../../../lib/immer'
import { bumpCounts, mergeComment, mergeComments } from '../graphql/store'
import {
  DiscussionQuery,
  DiscussionQueryVariables,
  useDiscussionQuery,
} from '../graphql/queries/DiscussionQuery.graphql'

// TODO: Add proper type
type CommentSubscriptionData = {
  comment: any
}

type CommentSubscriptionVariables = {
  discussionId: string
}

type DiscussionOptions = {
  orderBy: string
  activeTag?: string
  depth?: number
  focusId?: string
  parentId?: string
  includeParent?: boolean
}

type FetchMoreParams = DiscussionQueryVariables & {
  appendAfter?: string
}

export type FetchDiscussionFunctionType = (
  params?: Partial<FetchMoreParams>,
) => Promise<ApolloQueryResult<DiscussionQuery>>

// Data returned by the hook
type DiscussionData = {
  discussion: DiscussionQuery['discussion'] | undefined
  loading: boolean
  error: ApolloError
  refetch: FetchDiscussionFunctionType
  fetchMore: FetchDiscussionFunctionType
}

function useDiscussionData(
  discussionPath: string,
  options?: DiscussionOptions,
): DiscussionData {
  const {
    data: { discussion } = {},
    error,
    loading,
    fetchMore,
    subscribeToMore,
    refetch,
    previousData,
  } = useDiscussionQuery({
    variables: {
      discussionPath,
      orderBy: options.orderBy,
      depth: options.depth,
      focusId: options.focusId,
      activeTag: options.activeTag,
      parentId: options.parentId,
      includeParent: options.includeParent,
    },
  })

  /**
   * Merge previous and next comments when fetching more
   * @param parentId
   * @param after
   * @param appendAfter
   * @param depth
   * @param includeParent
   */
  const enhancedFetchMore = ({
    parentId,
    after,
    appendAfter,
    depth,
    includeParent,
  }: FetchMoreParams) =>
    fetchMore({
      variables: {
        discussionPath,
        parentId,
        after,
        orderBy: options.orderBy,
        activeTag: options.activeTag,
        depth: depth || 3,
        includeParent,
      },
      // Explanation: updateQuery is deprecated and not typed in TS
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      updateQuery: (previousResult, { fetchMoreResult: { discussion } }) => {
        return produce(
          previousResult,
          mergeComments({
            parentId,
            appendAfter,
            comments: discussion.comments,
          }),
        )
      },
    })

  const initialParentId = options.parentId
  const loadedDiscussionId = discussion?.id
  useEffect(() => {
    if (!loadedDiscussionId) {
      return
    }
    return subscribeToMore<
      CommentSubscriptionData,
      CommentSubscriptionVariables
    >({
      document: COMMENT_SUBSCRIPTION,
      variables: { discussionId: loadedDiscussionId },
      updateQuery: (previousResult, { subscriptionData }) => {
        /*
         * Regardless of what we do here, the Comment object in the cache will be updated.
         * We only have to take care of updating objects other than the Comment, like in
         * this case update the Discussion object. This is why we only care about the
         * 'CREATED' mutation and ignore 'DELETED' (which can't happen anyways) and 'UPDATED'.
         */
        if (
          subscriptionData.data &&
          subscriptionData.data.comment.mutation === 'CREATED'
        ) {
          const comment = subscriptionData.data.comment.node

          if (initialParentId && !comment.parentIds.includes(initialParentId)) {
            return previousResult
          }

          /*
           * Ignore updates related to comments we created in the current client session.
           * If this is the first comment in the discussion, show it immediately. Otherwise
           * just bump the counts and let the user click the "Load More" buttons.
           */
          if (previousResult.discussion.comments.totalCount === 0) {
            return produce(
              previousResult,
              mergeComment({
                comment,
                initialParentId,
                activeTag: options.activeTag,
              }),
            )
          } else {
            return produce(
              previousResult,
              bumpCounts({ comment, initialParentId }),
            )
          }
        } else {
          return previousResult
        }
      },
    })
  }, [loadedDiscussionId, initialParentId])

  return {
    discussion: discussion || previousData?.discussion,
    loading: loading,
    error,
    refetch,
    fetchMore: enhancedFetchMore,
  }
}

export default useDiscussionData

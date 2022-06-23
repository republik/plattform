import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import { toRejectedString } from '../utils'
import { optimisticContent } from '../store'
import * as docs from '../documents'

/**
 * Provides the component with
 *
 *   {
 *     upvoteComment(commentId: ID)
 *     downvoteComment(commentId: ID)
 *     reportComment(commentId: ID)
 *     unpublishComment(commentId: ID)
 *     editComment(comment: Comment, content: JSON, tags?: string[])
 *   }
 */

export const withCommentActions = compose(
  graphql(docs.UPVOTE_COMMENT_MUTATION, {
    props: ({ mutate }) => ({
      upvoteComment: (comment) =>
        mutate({ variables: { commentId: comment.id } }).catch(
          toRejectedString,
        ),
    }),
  }),
  graphql(docs.DOWN_VOTE_COMMENT_ACTION, {
    props: ({ mutate }) => ({
      downvoteComment: (comment) =>
        mutate({ variables: { commentId: comment.id } }).catch(
          toRejectedString,
        ),
    }),
  }),
  graphql(docs.UP_VOTE_COMMENT_ACTION, {
    props: ({ mutate }) => ({
      unvoteComment: (comment) =>
        mutate({ variables: { commentId: comment.id } }).catch(
          toRejectedString,
        ),
    }),
  }),
  graphql(docs.REPORT_COMMENT_MUTATION, {
    props: ({ mutate }) => ({
      reportComment: (comment) =>
        mutate({ variables: { commentId: comment.id } }).catch(
          toRejectedString,
        ),
    }),
  }),
  graphql(docs.UNPUBLISH_COMMENT_MUTATION, {
    props: ({ mutate }) => ({
      unpublishComment: (comment) =>
        mutate({ variables: { commentId: comment.id } }).catch(
          toRejectedString,
        ),
    }),
  }),
  graphql(docs.EDIT_COMMENT_MUTATION, {
    props: ({ mutate }) => ({
      editComment: (comment, content, tags) => {
        return mutate({
          variables: { commentId: comment.id, content, tags },
          optimisticResponse: {
            __typename: 'Mutation',
            editComment: {
              ...comment,
              ...optimisticContent(content),
            },
          },
        }).catch(toRejectedString)
      },
    }),
  }),
)

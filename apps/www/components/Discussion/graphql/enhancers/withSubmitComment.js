import compose from 'lodash/flowRight'
import { graphql, withApollo } from '@apollo/client/react/hoc'
import { v4 as uuid } from 'uuid'

import produce from '../../../../lib/immer'
import withT from '../../../../lib/withT'

import { withDiscussionDisplayAuthor } from './withDiscussionDisplayAuthor'
import { toRejectedString } from '../utils'
import { mergeComment, optimisticContent } from '../store'
import { DISCUSSION_QUERY } from '../queries/DiscussionQuery.graphql'
import { SUBMIT_COMMENT_MUTATION } from '../mutations/SubmitCommentMutation.graphql'
import { PREVIEW_COMMENT_QUERY } from '../queries/PreviewCommentQuery.graphql'

/**
 * Provides the component with
 *
 *   {
 *     submitComment(parent: Comment, content: string, tags?: string[])
 *   }
 */

export const withSubmitComment = compose(
  withT,
  withDiscussionDisplayAuthor,
  withApollo,
  graphql(SUBMIT_COMMENT_MUTATION, {
    props: ({
      ownProps: {
        t,
        discussionId,
        parentId: initialParentId,
        orderBy,
        activeTag,
        depth,
        focusId,
        discussionDisplayAuthor: displayAuthor,
        discussionUserPreference: userPreference,
        client,
        includeParent,
      },
      mutate,
    }) => ({
      previewComment: ({ content, discussionId, parentId, id }) => {
        return client
          .query({
            query: PREVIEW_COMMENT_QUERY,
            variables: {
              content,
              discussionId,
              parentId,
              id,
            },
            fetchPolicy: 'no-cache',
          })
          .then(({ data }) => {
            return data.commentPreview
          })
      },
      submitComment: (parent, content, tags = []) => {
        if (!displayAuthor) {
          return Promise.reject(t('submitComment/noDisplayAuthor'))
        }

        /*
         * Generate a new UUID for the comment. We do this client-side so that we can
         * properly handle subscription notifications.
         */
        const id = uuid()

        const { parentId, parentIds } = parent
          ? {
              parentId: parent.id,
              parentIds: parent.parentIds.concat(parent.id),
            }
          : { parentId: null, parentIds: [] }

        return mutate({
          variables: { discussionId, parentId, id, content, tags },
          optimisticResponse: {
            __typename: 'Mutation',
            submitComment: {
              __typename: 'Comment',
              id,
              ...optimisticContent(content),
              published: true,
              adminUnpublished: false,
              userCanEdit: true,
              featuredAt: null,
              featuredText: null,
              downVotes: 0,
              upVotes: 0,
              userVote: null,
              displayAuthor,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              parentIds,
              tags,
              userCanReport: false,
              userReportedAt: null,
              numReports: 0,
              unreadNotifications: null,
              featuredTargets: null,
              discussion: {
                __typename: 'Discussion',
                id: discussionId,
                userPreference: {
                  __typename: 'DiscussionPreferences',
                  notifications: userPreference.notifications,
                },
                userWaitUntil: null,
              },
            },
          },
          update: (proxy, { data: { submitComment: comment } }) => {
            const variables = {
              discussionId,
              parentId: initialParentId,
              orderBy,
              activeTag,
              depth,
              focusId,
              includeParent,
            }

            proxy.writeQuery({
              query: DISCUSSION_QUERY,
              variables,
              data: produce(
                proxy.readQuery({ query: DISCUSSION_QUERY, variables }),
                mergeComment({
                  comment,
                  initialParentId,
                  activeTag,
                }),
              ),
            })
          },
        }).catch(toRejectedString)
      },
    }),
  }),
)

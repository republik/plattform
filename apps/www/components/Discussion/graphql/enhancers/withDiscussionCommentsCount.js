import { graphql } from '@apollo/client/react/hoc'
import { DISCUSSION_POLL_INTERVAL_MS } from '../../../../lib/constants'

import { discussionCommentsCountQuery } from '../documents'

/**
 * Provides the component with
 *
 *   {
 *     discussionCommentsCount: false | number
 *   }
 */

export const withDiscussionCommentsCount = graphql(
  discussionCommentsCountQuery,
  {
    options: {
      pollInterval: DISCUSSION_POLL_INTERVAL_MS,
    },
    props: ({ data: { discussion } }) => ({
      discussionCommentsCount:
        discussion && discussion.comments && discussion.comments.totalCount,
    }),
  },
)

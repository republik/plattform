import { graphql } from '@apollo/client/react/hoc'

import { discussionDisplayAuthorQuery } from '../documents'

/**
 * Provides the component with
 *
 *   {
 *     discussionClosed: boolean
 *     discussionUserCanComment: boolean
 *     discussionDisplayAuthor: { id, name, profilePicture, … }
 *   }
 *
 * @todo: Rename this enhancer, as it provides more than just display author.
 */

export const withDiscussionDisplayAuthor = graphql(
  discussionDisplayAuthorQuery,
  {
    props: ({ data: { discussion } }) => {
      if (!discussion) {
        return {}
      }

      return {
        discussionClosed: discussion.closed,
        discussionUserPreference: discussion.userPreference,
        discussionUserCanComment: discussion.userCanComment,
        discussionDisplayAuthor: discussion.displayAuthor,
      }
    },
  },
)

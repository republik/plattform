import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import produce from '../../../../lib/immer'

import { SET_DISCUSSION_PREFERENCES_MUTATION } from '../documents'
import { toRejectedString } from '../utils'
import { DISCUSSION_PREFERENCES_QUERY } from '../queries/DiscussionPreferencesQuery.graphql'

/**
 * Provides the component with:
 *
 *   {
 *     discussionPreferences: { … } // discussionPreferencesQuery Result
 *     setDiscussionPreferences(anonimity, credential, notifications)
 *   }
 */

export const withDiscussionPreferences = compose(
  graphql(DISCUSSION_PREFERENCES_QUERY, { name: 'discussionPreferences' }),
  graphql(SET_DISCUSSION_PREFERENCES_MUTATION, {
    props: ({ ownProps: { discussionId }, mutate }) => ({
      setDiscussionPreferences: (anonymity, credential, notifications) => {
        return mutate({
          variables: {
            discussionId,
            discussionPreferences: {
              anonymity,
              credential: credential && credential.trim() ? credential : null,
              notifications,
            },
          },
          update: (proxy, { data: { setDiscussionPreferences } }) => {
            const variables = { discussionId }
            const data = proxy.readQuery({
              query: DISCUSSION_PREFERENCES_QUERY,
              variables,
            })
            proxy.writeQuery({
              query: DISCUSSION_PREFERENCES_QUERY,
              variables,
              data: produce(data, (draft) => {
                draft.discussion.userPreference =
                  setDiscussionPreferences.userPreference
                draft.discussion.displayAuthor =
                  setDiscussionPreferences.displayAuthor
              }),
            })
          },
        }).catch(toRejectedString)
      },
    }),
  }),
)

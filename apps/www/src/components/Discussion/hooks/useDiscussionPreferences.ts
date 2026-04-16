import { ApolloError, useMutation, FetchResult } from '@apollo/client'
import { SET_DISCUSSION_PREFERENCES_MUTATION } from '../graphql/documents'
import { toRejectedString } from '../graphql/utils'
import {
  DiscussionPreferencesQuery,
  useDiscussionPreferencesQuery,
} from '../graphql/queries/DiscussionPreferencesQuery.graphql'

type DiscussionNotificationOption = 'MY_CHILDREN' | 'ALL' | 'NONE'

type SetDiscussionPreferencesMutationVariables = {
  discussionId: string
  discussionPreferences: {
    anonymity?: boolean
    credential?: string
    notifications?: DiscussionNotificationOption
  }
}

// TODO: Define type
type SetDiscussionPreferencesMutationResult = unknown

export type SetDiscussionPreferencesHandler = (
  anonymity: boolean,
  credential: string,
  notifications?: DiscussionNotificationOption,
) => Promise<FetchResult<SetDiscussionPreferencesMutationResult>>

type DiscussionPreferences = {
  preferences: DiscussionPreferencesQuery | undefined
  loading: boolean
  error?: ApolloError
  updateDiscussionPreferencesHandler: SetDiscussionPreferencesHandler
}

function useDiscussionPreferences(discussionId: string): DiscussionPreferences {
  const { data, loading, error, refetch } = useDiscussionPreferencesQuery({
    variables: { discussionId },
  })

  const [setDiscussionPreferencesMutation] = useMutation<
    SetDiscussionPreferencesMutationResult,
    SetDiscussionPreferencesMutationVariables
  >(SET_DISCUSSION_PREFERENCES_MUTATION)

  /**
   * Update the discussionPreferences and trigger a refetch from the server
   * @param anonymity
   * @param credential
   * @param notifications
   */
  async function updateDiscussionPreferencesHandler(
    anonymity: boolean,
    credential: string,
    notifications?: DiscussionNotificationOption,
  ) {
    return setDiscussionPreferencesMutation({
      variables: {
        discussionId,
        discussionPreferences: {
          anonymity,
          credential: credential?.trim() || null,
          notifications,
        },
      },
    })
      .then((result) => {
        return refetch().then(() => result)
      })
      .catch(toRejectedString)
  }

  return {
    preferences: data,
    loading,
    error,
    updateDiscussionPreferencesHandler,
  }
}

export default useDiscussionPreferences

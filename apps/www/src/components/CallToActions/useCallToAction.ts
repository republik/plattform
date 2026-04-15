import { ApolloError } from '@apollo/client'
import { CallToAction } from './graphql/CallToAction'
import { useCallToActionsQuery } from './graphql/useCallToActionsQuery'

/**
 * Get the current user's CallToActions
 * @returns {
 *  data: CallToAction
 *  loading: boolean
 *  error: ApolloError
 * }
 */
export default function useCallToAction(): {
  data?: CallToAction[]
  loading: boolean
  error?: ApolloError
  refetch: () => void
} {
  const { data, loading, error, refetch } = useCallToActionsQuery()
  const callToActions = data?.me?.callToActions
  const activeCTAs = callToActions?.filter((cta) => !cta.acknowledgedAt)

  return {
    data: activeCTAs,
    loading,
    error,
    refetch,
  }
}

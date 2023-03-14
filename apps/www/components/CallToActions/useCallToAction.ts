import { ApolloError } from '@apollo/client'
import { useMemo } from 'react'
import { CallToAction } from './graphql/CallToAction'
import { useCallToActionsQuery } from './graphql/useCallToActionsQuery'

/**
 * Get the current user's CallToActions
 * @returns {
 *  data: CallToAction
 *  loading: boolean
 *  error: ApolloError
 *  handleDismiss: (id: string) => void
 * }
 */
export default function useCallToAction(): {
  data?: CallToAction
  loading: boolean
  error?: ApolloError
  refetch: () => void
} {
  const { data, loading, error, refetch } = useCallToActionsQuery()
  const callToActions = data?.me?.callToActions
  const activeCTA = callToActions?.find((cta) => !cta.acknowledgedAt)

  return {
    data: activeCTA,
    loading,
    error,
    refetch,
  }
}

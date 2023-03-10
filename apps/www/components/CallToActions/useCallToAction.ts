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
  const callToActions = data?.me.callToActions
  const activeCTA: CallToAction = useMemo(() => {
    if (!callToActions || callToActions.length === 0) {
      return undefined
    }
    // TODO: Even with the optimistic update when dismissing a CTA, the CTA
    // is still returned with the find function below.
    // As a workaround, we refetch the ctas atm. but this is not ideal.
    return callToActions.find((cta) => !cta.acknowlegedAt)
  }, [JSON.stringify(callToActions)])

  return {
    data: activeCTA,
    loading,
    error,
    refetch,
  }
}

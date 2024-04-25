import { ErrorResponse, onError } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'

// Forward GQL errors to sentry
export const SentryErrorLink = onError((error: ErrorResponse) => {
  Sentry.withScope((scope) => {
    scope.setTag('kind', 'apollo-error')

    if (error.operation) {
      scope.setContext('operation', { ...error.operation })
    }

    if (error.networkError) {
      scope.setContext('networkError', { ...error.networkError })
    }

    if (error.graphQLErrors) {
      error.graphQLErrors.map((graphQLError, i) => {
        scope.setContext('graphQLError-' + i, { ...graphQLError })
      })
    }

    Sentry.captureException(error)
  })
})

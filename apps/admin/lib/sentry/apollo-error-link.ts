import { ErrorResponse, onError } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'

// Forward GQL errors to sentry
export const SentryErrorLink = onError((error: ErrorResponse) => {
  Sentry.withScope((scope) => {
    scope.setExtra('operation', error.operation)
    if (error.networkError) {
      scope.setExtra('networkError', error.networkError)
    }
    if (error.graphQLErrors) {
      error.graphQLErrors.map((graphQLError) => {
        scope.setExtra('graphQLError', graphQLError)
      })
    }

    Sentry.captureException(error)
  })
})

import { ApolloLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'
import { SentryLink as ApolloSentryLink } from 'apollo-link-sentry'

const sentryLink = new ApolloSentryLink({
  setTransaction: false,
  setFingerprint: false,
  attachBreadcrumbs: {
    includeError: true,
  },
})

const errorLink = onError(({ operation, graphQLErrors, networkError }) => {
  Sentry.withScope((scope) => {
    scope.setTransactionName(operation.operationName)
    scope.setContext('apolloGraphQLOperation', {
      operationName: operation.operationName,
      variables: operation.variables,
      extensions: operation.extensions,
    })

    graphQLErrors?.forEach((error) => {
      Sentry.captureMessage(error.message, {
        level: 'error',
        fingerprint: ['{{ default }}', '{{ transaction }}'],
        contexts: {
          apolloGraphQLError: {
            error,
            message: error.message,
            extensions: error.extensions,
          },
        },
      })
    })

    if (networkError) {
      Sentry.captureMessage(networkError.message, {
        level: 'error',
        contexts: {
          apolloNetworkError: {
            error: networkError,
            extensions: (networkError as any).extensions,
          },
        },
      })
    }
  })
})

export const SentryLink = ApolloLink.from([sentryLink, errorLink])

'use client'

import { ApolloError } from '@apollo/client'

import { Alert, AlertDescription, AlertTitle } from '../../ui/alert'

export const ErrorMessage = ({
  error,
}: {
  error: string | ApolloError | undefined
}) => {
  const message =
    typeof error === 'string'
      ? error
      : error?.networkError
      ? 'Network error'
      : error?.graphQLErrors[0]?.message

  return (
    <Alert variant='error'>
      <AlertTitle>Error</AlertTitle>
      {message && <AlertDescription>{message}</AlertDescription>}
    </Alert>
  )
}

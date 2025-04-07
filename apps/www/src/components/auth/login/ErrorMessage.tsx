'use client'

import { ApolloError } from '@apollo/client'
import { IconInfoOutline } from '@republik/icons'
import { css } from '@republik/theme/css'

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
    <div
      className={css({
        color: 'error',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: '1',
      })}
    >
      <IconInfoOutline />
      <p>{message || 'Error'}</p>
    </div>
  )
}

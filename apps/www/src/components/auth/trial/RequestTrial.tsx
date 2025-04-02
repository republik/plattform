'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'

import { ApolloError, useApolloClient } from '@apollo/client'

import { RequestAccessDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import { REGWALL_CAMPAIGN } from 'lib/constants'
import { getConversionPayload } from 'lib/utils/conversion-payload'

import { Spinner } from '../../ui/spinner'

import { reloadPage } from '../login/utils'
import { ErrorMessage } from '../login/ErrorMessage'

import { TrialFormProps } from '.'

// This component is used in the trial flow when the user is already authenticated.
const RequestTrial = (props: TrialFormProps) => {
  const gql = useApolloClient()
  const router = useRouter()
  const { query } = router
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  const requestTrialAccess = async (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setPending(true)

    const autorizedRes = await gql.mutate({
      mutation: RequestAccessDocument,
      variables: {
        campaignId: REGWALL_CAMPAIGN,
        payload: getConversionPayload(query),
      },
    })

    if (autorizedRes.errors && autorizedRes.errors.length > 0) {
      setError(new ApolloError({ graphQLErrors: autorizedRes.errors }))
      setPending(false)
      return
    }

    if (autorizedRes.data?.requestAccess.id) {
      reloadPage()
    }
  }

  return (
    <form action='POST' onSubmit={requestTrialAccess}>
      {error && <ErrorMessage error={error} />}

      {pending ? (
        <>
          <span>starting trial</span> <Spinner />
        </>
      ) : (
        <button type='submit'>Get access</button>
      )}
    </form>
  )
}

export default RequestTrial

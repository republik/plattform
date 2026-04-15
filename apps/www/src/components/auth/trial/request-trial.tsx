'use client'

import { useState } from 'react'
import { useRouter } from 'next/router'

import { ApolloError, useApolloClient } from '@apollo/client'

import { useTrackEvent } from '@app/lib/analytics/event-tracking'

import { RequestAccessDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import { REGWALL_CAMPAIGN } from 'lib/constants'
import { getConversionPayload } from 'lib/utils/conversion-payload'
import { useTranslation } from 'lib/withT'

import { reloadPage } from '../login/utils'
import { ErrorMessage } from '../login/error-message'
import { Submit } from '../login'

import { TrialFormProps } from '.'

// This component is used in the trial flow when the user is already authenticated.
const RequestTrial = (props: TrialFormProps) => {
  const gql = useApolloClient()
  const router = useRouter()
  const { query } = router
  const { t } = useTranslation()
  const trackEvent = useTrackEvent()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<ApolloError | undefined>()

  const requestTrialAccess = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setPending(true)

    gql
      .mutate({
        mutation: RequestAccessDocument,
        variables: {
          campaignId: REGWALL_CAMPAIGN,
          payload: getConversionPayload(query),
        },
      })
      .then(() => {
        trackEvent({ action: 'Requested a trial' })
        reloadPage('trial')
      })
      .catch((err) => {
        setError(err)
        setPending(false)
      })
  }

  return (
    <form action='POST' onSubmit={requestTrialAccess}>
      {props.renderBefore}
      {error && <ErrorMessage error={error} />}
      <Submit pending={pending}>{t('auth/trial/request')}</Submit>
      {props.renderAfter}
    </form>
  )
}

export default RequestTrial

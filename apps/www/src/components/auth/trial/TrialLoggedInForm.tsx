import { useRouter } from 'next/router'
import { useMutation, useApolloClient } from '@apollo/client'

import { RequestAccessDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import { REGWALL_CAMPAIGN } from 'lib/constants'
import { getConversionPayload } from 'lib/utils/conversion-payload'

import { addStatusParamToRouter } from './utils'

const TrialLoggedInForm = ({ onSuccess, payload }) => {
  const router = useRouter()
  const apolloClient = useApolloClient()
  const [requestAccess] = useMutation(RequestAccessDocument)
  const { query } = router

  const setStatus = addStatusParamToRouter(router)

  const requestTrialAccess = (e) => {
    e?.preventDefault()

    requestAccess({
      variables: {
        campaignId: REGWALL_CAMPAIGN,
        payload: { ...getConversionPayload(query), ...payload },
      },
    }).then(() => {
      setStatus('success')
      apolloClient.resetStore()
      onSuccess()
    })
  }

  return (
    <form action='POST' onSubmit={requestTrialAccess}>
      <button type='submit'>Get access</button>
    </form>
  )
}

export default TrialLoggedInForm

import { useRouter } from 'next/router'
import { useMutation } from '@apollo/client'

import { RequestAccessDocument } from '#graphql/republik-api/__generated__/gql/graphql'

import { REGWALL_CAMPAIGN } from 'lib/constants'
import { getConversionPayload } from 'lib/utils/conversion-payload'

type RequestTrialProps = {
  onSuccess: () => void
}

// This component is used in the trial flow when the user is already authenticated.
const RequestTrial = ({ onSuccess }: RequestTrialProps) => {
  const router = useRouter()
  const [requestAccess] = useMutation(RequestAccessDocument)
  const { query } = router

  const requestTrialAccess = (e: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    requestAccess({
      variables: {
        campaignId: REGWALL_CAMPAIGN,
        payload: getConversionPayload(query),
      },
    }).then(onSuccess)
  }

  return (
    <form action='POST' onSubmit={requestTrialAccess}>
      <button type='submit'>Get access</button>
    </form>
  )
}

export default RequestTrial

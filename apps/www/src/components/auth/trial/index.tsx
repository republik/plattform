import { useState } from 'react'
import { useRouter } from 'next/router'
import { useApolloClient } from '@apollo/client'

import { useMe } from 'lib/context/MeContext'

import RequestTrial from './RequestTrial'
import RegisterForTrial from './RegisterForTrial'
import Success from './TrialSuccess'
import { addStatusParamToRouter } from './utils'

type StepType = 'FORM' | 'SUCCESS'

interface TrialFormProps {
  onSuccess: () => void
}

const TrialForm = ({ onSuccess }: TrialFormProps) => {
  const { me } = useMe()
  return me ? (
    <RequestTrial onSuccess={onSuccess} />
  ) : (
    <RegisterForTrial onSuccess={onSuccess} />
  )
}

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const Trial = () => {
  const router = useRouter()
  const apolloClient = useApolloClient()

  const [step, setStep] = useState<StepType>('FORM')

  const onSuccess = () => {
    apolloClient.resetStore()
    // we use the status param in the route to …… (TODO: add explanation)
    addStatusParamToRouter(router)('success')
    setStep('SUCCESS')
  }

  const STEPS = {
    FORM: <TrialForm onSuccess={onSuccess} />,
    SUCCESS: <Success />,
  }

  return STEPS[step]
}

export default Trial

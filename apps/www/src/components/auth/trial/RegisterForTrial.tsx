import { useState } from 'react'
import SubmitEmail from './SubmitEmail'
import AuthorizeWithCode from './AuthorizeWithCode'

type StepType = 'SUBMIT_EMAIL' | 'AUTHORIZE_WITH_CODE'

type RegisterForTrialProps = {
  onSuccess: () => void
}

// This component is used in the trial flow when the user is not authenticated.
// It consists of two steps:
// 1. Submit email and receive a verification code via email
// 2. Request access with email/verification code
const RegisterForTrial = ({ onSuccess }: RegisterForTrialProps) => {
  const [email, setEmail] = useState<string>('')
  const [step, setStep] = useState<StepType>('SUBMIT_EMAIL')

  const STEPS: Record<StepType, JSX.Element> = {
    SUBMIT_EMAIL: (
      <SubmitEmail
        onSuccess={(_email) => {
          setEmail(_email)
          setStep('AUTHORIZE_WITH_CODE')
        }}
        onError={() => setStep('SUBMIT_EMAIL')}
      />
    ),
    AUTHORIZE_WITH_CODE: (
      <AuthorizeWithCode
        email={email}
        onSuccess={onSuccess}
        onError={() => setStep('SUBMIT_EMAIL')}
      />
    ),
  }

  return STEPS[step]
}

export default RegisterForTrial

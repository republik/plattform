import { useState } from 'react'

import { useMe } from 'lib/context/MeContext'

import LoggedInForm from './TrialLoggedInForm'
import LoggedOutForm from './TrialLoggedOutForm'
import Success from './TrialSuccess'

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const Form = ({ payload, context = 'trial' }) => {
  const { me, hasActiveMembership } = useMe()
  const [step, setStep] = useState(hasActiveMembership ? 'SUCCESS' : 'REQUEST') // REQUEST, SUCCESS

  const onSuccess = () => {
    setStep('SUCCESS')
  }

  return (
    <>
      {step === 'REQUEST' && !me && <LoggedOutForm onSuccess={onSuccess} />}
      {step === 'REQUEST' && me && (
        <LoggedInForm onSuccess={onSuccess} payload={payload} />
      )}
      {step === 'SUCCESS' && <Success context={context} />}
    </>
  )
}

export default Form

import { useState } from 'react'
import EmailForm from './TrialEmailForm'
import CodeForm from './TrialCodeForm'

const TrialLoggedOutForm = ({ onSuccess }) => {
  const [email, setEmail] = useState('')
  const [step, setStep] = useState('EMAIL') // EMAIL, CODE

  return (
    <>
      {step === 'EMAIL' && (
        <EmailForm
          onSuccess={(_email) => {
            setEmail(_email)
            setStep('CODE')
          }}
          onError={() => setStep('EMAIL')}
        />
      )}

      {step === 'CODE' && (
        <CodeForm
          email={email}
          onSuccess={onSuccess}
          onError={() => setStep('EMAIL')}
        />
      )}
    </>
  )
}

export default TrialLoggedOutForm

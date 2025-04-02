import { LoginForm } from '../login'

import { TrialFormProps } from '.'

// This component is used in the trial flow when the user is not authenticated.
// It consists of two steps:
// 1. Submit email and receive a verification code via email
// 2. Request access with email/verification code
const RegisterForTrial = (props: TrialFormProps) => {
  return (
    <LoginForm
      context='trial'
      submitButtonText='Anmelden und weiterlesen'
      renderBefore={props.renderBefore}
      renderAfter={props.renderAfter}
    />
  )
}

export default RegisterForTrial

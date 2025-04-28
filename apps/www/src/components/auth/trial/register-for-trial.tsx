import { LoginForm } from '../login'

import { TrialFormProps } from '.'
import { useTranslation } from 'lib/withT'

// This component is used in the trial flow when the user is not authenticated.
// It consists of two steps:
// 1. Submit email and receive a verification code via email
// 2. Request access with email/verification code
const RegisterForTrial = (props: TrialFormProps) => {
  const { t } = useTranslation()

  return (
    <LoginForm
      context='trial'
      submitButtonText={t(`regwall/${props.analyticsProps.variation}/cta`)}
      {...props}
    />
  )
}

export default RegisterForTrial

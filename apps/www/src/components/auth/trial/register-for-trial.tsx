import { css } from '@republik/theme/css'
import { useMe } from 'lib/context/MeContext'

import { useTranslation } from 'lib/withT'
import { TrialFormProps } from '.'

import { LoginForm } from '../login'

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

export const RegisterForTrialMinimal = () => {
  const { t } = useTranslation()
  const { me, meLoading } = useMe()
  const analyticsProps = { variation: 'a' }

  if (me || meLoading) {
    return null
  }

  return (
    <div
      className={css({
        color: 'text',
        margin: '0 auto',
        padding: '6',
        maxW: 'narrow',
      })}
    >
      <LoginForm
        context='trial'
        analyticsProps={analyticsProps}
        submitButtonText={t(`regwall/${analyticsProps.variation}/cta`)}
        redirectUrl='/'
      />
    </div>
  )
}

export default RegisterForTrial

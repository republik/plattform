import { ReactNode } from 'react'

import { useMe } from 'lib/context/MeContext'

import RequestTrial from './request-trial'
import RegisterForTrial from './register-for-trial'

export interface TrialFormProps {
  renderBefore?: ReactNode
  renderAfter?: ReactNode
}

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const TrialForm = (props: TrialFormProps) => {
  const { me } = useMe()

  return me ? (
    <RequestTrial
      renderBefore={props.renderBefore}
      renderAfter={props.renderAfter}
    />
  ) : (
    <RegisterForTrial
      renderBefore={props.renderBefore}
      renderAfter={props.renderAfter}
    />
  )
}

export default TrialForm

import { ReactNode } from 'react'

import { useMe } from 'lib/context/MeContext'

import RequestTrial from './RequestTrial'
import RegisterForTrial from './RegisterForTrial'

export interface TrialFormProps {
  renderBefore?: ReactNode
  renderAfter?: ReactNode
}

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const TrialForm = (props: TrialFormProps) => {
  const { me } = useMe()

  // return me ? <RequestTrial /> : <RegisterForTrial />
  return (
    <RegisterForTrial
      renderBefore={props.renderBefore}
      renderAfter={props.renderAfter}
    />
  )
}

export default TrialForm

import { useMe } from 'lib/context/MeContext'

import RequestTrial from './RequestTrial'
import RegisterForTrial from './RegisterForTrial'

// Assumptions:
//  - Users who see this form are eligible for trial access
//  - Some users may already by authenticated
const TrialForm = () => {
  const { me } = useMe()

  return me ? <RequestTrial /> : <RegisterForTrial />
}

export default TrialForm

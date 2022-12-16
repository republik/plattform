import Onboarding from '../components/Onboarding/Page'

import { enforceRoles } from '../components/Auth/withMembership'
import { withDefaultSSR } from '../lib/apollo/helpers'

export default withDefaultSSR(enforceRoles(['member', 'climate'])(Onboarding))

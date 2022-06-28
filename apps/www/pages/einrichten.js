import Onboarding from '../components/Onboarding/Page'

import { enforceMembership } from '../components/Auth/withMembership'
import { withDefaultSSR } from '../lib/apollo/helpers'

export default withDefaultSSR(enforceMembership()(Onboarding))

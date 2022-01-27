import Onboarding from '../components/Onboarding/Page'

import { enforceMembership } from '../components/Auth/withMembership'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

export default withDefaultSSR(enforceMembership()(Onboarding))

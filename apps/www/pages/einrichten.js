import Onboarding from '../components/Onboarding/Page'

import { enforceMembership } from '../components/Auth/withMembership'
import { withDefaultSSR } from '../lib/apollo/helpers'

/* instead of enforceMembership we need something else here, so that non-members but climate lab users can access onboarding page as well */
export default withDefaultSSR(enforceMembership()(Onboarding))

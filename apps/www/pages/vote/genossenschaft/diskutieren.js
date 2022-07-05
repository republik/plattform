import ElectionDiscussionPage from '../../../components/Vote/Legacy/ElectionDiscussionPage'
import compose from 'lodash/flowRight'
import { enforceMembership } from '../../../components/Auth/withMembership'
import withMe from '../../../lib/apollo/withMe'
import { withDefaultSSR } from '../../../lib/apollo/helpers'

export default withDefaultSSR(
  compose(enforceMembership(), withMe)(ElectionDiscussionPage),
)

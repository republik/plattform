import ElectionDiscussionPage from '../../../components/Vote/Legacy/ElectionDiscussionPage'
import compose from 'lodash/flowRight'
import { enforceMembership } from '../../../components/Auth/withMembership'
import { withDefaultSSR } from '../../../lib/apollo/helpers'
import { withMe } from '@project-r/styleguide'

export default withDefaultSSR(
  compose(enforceMembership(), withMe)(ElectionDiscussionPage),
)

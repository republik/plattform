import { ForceOnboarding } from '@app/components/onboarding/force-onboarding'
import compose from 'lodash/flowRight'
import { enforceMembership } from '../components/Auth/withMembership'
import Feed from '../components/Feed'
import { withDefaultSSR } from '../lib/apollo/helpers'
import withMe from '../lib/apollo/withMe'

import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import withT from '../lib/withT'

const FeedPage = ({ t }) => {
  const meta = {
    title: t('pages/feed/title'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
  }

  return (
    <ForceOnboarding>
      <Feed meta={meta} />
    </ForceOnboarding>
  )
}

export default withDefaultSSR(
  compose(enforceMembership(), withMe, withT)(FeedPage),
)

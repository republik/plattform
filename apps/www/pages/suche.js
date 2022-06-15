import compose from 'lodash/flowRight'
import { withRouter } from 'next/router'
import Frame from '../components/Frame'
import Search from '../components/Search'
import { enforceMembership } from '../components/Auth/withMembership'
import withT from '../lib/withT'

import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { withDefaultSSR } from '../lib/apollo/helpers'

const SearchPage = ({ router, t }) => {
  const meta = {
    title: t('pages/search/title'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
  }
  return (
    <Frame raw meta={meta}>
      <Search query={router.query} />
    </Frame>
  )
}

export default withDefaultSSR(
  compose(enforceMembership(), withT, withRouter)(SearchPage),
)

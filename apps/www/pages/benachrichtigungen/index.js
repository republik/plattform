import compose from 'lodash/flowRight'
import Frame from '../../components/Frame'
import Notifications from '../../components/Notifications'
import withT from '../../lib/withT'
import SignIn from '../../components/Auth/SignIn'
import { Interaction, withMe } from '@project-r/styleguide'

import { CDN_FRONTEND_BASE_URL } from '../../lib/constants'
import { withDefaultSSR } from '../../lib/apollo/helpers'

const NotificationsPage = ({ t, me }) => {
  const meta = {
    title: t('pages/notifications/title'),
    image: `${CDN_FRONTEND_BASE_URL}/static/social-media/logo.png`,
  }
  return (
    <Frame raw={!!me} meta={meta}>
      {me ? (
        <Notifications />
      ) : (
        <>
          <Interaction.H1 style={{ marginBottom: 40 }}>
            {t('pages/notifications/title')}
          </Interaction.H1>
          <SignIn />
        </>
      )}
    </Frame>
  )
}

export default withDefaultSSR(compose(withMe, withT)(NotificationsPage))

import Frame from '../../components/Frame'
import NotificationsSettings from '../../components/Notifications/Settings'
import withT from '../../lib/withT'

import AccountTabs from '../../components/Account/AccountTabs'
import { AccountEnforceMe } from '../../components/Account/Elements'

import withDefaultSSR from '../../lib/hocs/withDefaultSSR'

const NotificationsSettingsPage = ({ t }) => {
  return (
    <Frame
      meta={{
        title: t('pages/account/notifications/title'),
      }}
    >
      <AccountEnforceMe>
        <AccountTabs />

        <NotificationsSettings />
      </AccountEnforceMe>
    </Frame>
  )
}

export default withDefaultSSR(withT(NotificationsSettingsPage))

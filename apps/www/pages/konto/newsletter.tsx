import NewslettersOverview from '@app/components/newsletters/newsletters-overview'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import compose from 'lodash/flowRight'

import AccountTabs from '../../components/Account/AccountTabs'
import { AccountEnforceMe } from '../../components/Account/Elements'
import Frame from '../../components/Frame'
import { withDefaultSSR } from '../../lib/apollo/helpers'

import withT from '../../lib/withT'

const SettingsPage = ({ t }) => {
  return (
    <EventTrackingContext category='Account'>
      <Frame
        meta={{
          title: t('pages/account/newsletter/title'),
        }}
      >
        <AccountEnforceMe>
          <AccountTabs />
          <NewslettersOverview />
        </AccountEnforceMe>
      </Frame>
    </EventTrackingContext>
  )
}

export default withDefaultSSR(compose(withT)(SettingsPage))

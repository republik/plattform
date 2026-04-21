import {
  NL_COURSES,
  NL_FEATURED,
  NL_MORE,
} from '@/app/components/newsletters/config'
import NewslettersOverview from '@/app/components/newsletters/newsletters-overview'
import { EventTrackingContext } from '@/app/lib/analytics/event-tracking'

import AccountTabs from '@/components/Account/AccountTabs'
import { AccountEnforceMe } from '@/components/Account/Elements'
import Frame from '@/components/Frame'
import { withDefaultSSR } from '@/lib/apollo/helpers'

import withT from '@/lib/withT'
import compose from 'lodash/flowRight'

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
          <NewslettersOverview
            nlFeatured={NL_FEATURED}
            nlMore={NL_MORE}
            nlCourses={NL_COURSES}
          />
        </AccountEnforceMe>
      </Frame>
    </EventTrackingContext>
  )
}

export default withDefaultSSR(compose(withT)(SettingsPage))

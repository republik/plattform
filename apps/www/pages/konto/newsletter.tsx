import { NewsletterName } from '#graphql/republik-api/__generated__/gql/graphql'
import NewslettersOverview from '@app/components/newsletters/newsletters-overview'
import { EventTrackingContext } from '@app/lib/analytics/event-tracking'
import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'

import AccountTabs from '../../components/Account/AccountTabs'
import { AccountEnforceMe } from '../../components/Account/Elements'
import {
  FRAME_CONTENT_PADDING,
  FRAME_CONTENT_PADDING_MOBILE,
} from '../../components/constants'
import Frame from '../../components/Frame'
import { withDefaultSSR } from '../../lib/apollo/helpers'

import withT from '../../lib/withT'

const SettingsPage = ({ t }) => {
  return (
    <EventTrackingContext category='Account'>
      <Frame
        raw
        meta={{
          title: t('pages/account/newsletter/title'),
        }}
      >
        <AccountEnforceMe>
          <div
            style={{ maxWidth: '840px' }}
            {...css({
              margin: '0 auto',
              paddingTop: FRAME_CONTENT_PADDING_MOBILE,
              [mediaQueries.mUp]: {
                paddingTop: FRAME_CONTENT_PADDING,
              },
            })}
          >
            <AccountTabs />
          </div>
          <NewslettersOverview
            nlFeatured={[
              NewsletterName.Daily,
              NewsletterName.Wdwww,
              NewsletterName.Weekly,
            ]}
            nlMore={[
              NewsletterName.Climate,
              NewsletterName.Sunday,
              NewsletterName.Projectr,
            ]}
          />
        </AccountEnforceMe>
      </Frame>
    </EventTrackingContext>
  )
}

export default withDefaultSSR(compose(withT)(SettingsPage))

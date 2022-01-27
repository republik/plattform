import React from 'react'
import compose from 'lodash/flowRight'
import AccessCampaigns from '../components/Access/Campaigns'
import Frame from '../components/Frame'
import { enforceMembership } from '../components/Auth/withMembership'
import { t } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'

const meta = {
  title: t('pages/access/title')
}

const Page = () => (
  <Frame meta={meta}>
    <AccessCampaigns />
  </Frame>
)

export default withDefaultSSR(compose(enforceMembership())(Page))

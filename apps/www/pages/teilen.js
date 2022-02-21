import React, { useState } from 'react'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import withT from '../lib/withT'
import { CROWDFUNDING } from '../lib/constants'
import { withMembership } from '../components/Auth/checkRoles'

import { PackageItem } from '../components/Pledge/Accordion'
import AccessCampaigns from '../components/Access/Campaigns'
import ShareChart from '../components/Access/Campaigns/ShareChart'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'

const meta = {
  title: t('pages/access/title'),
}

const Page = ({ me, t }) => {
  const [hover, setHover] = useState()

  return (
    <Frame meta={meta}>
      {/* e3568e03-b6b3-46c5-b07a-e9afeea92023 "Teilen Sie Ihr Abonnement" */}
      <ShareChart accessCampaignId='e3568e03-b6b3-46c5-b07a-e9afeea92023' />
      <AccessCampaigns />
      {!me ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            <strong>{t('Account/Access/Campaigns/login/title')}</strong>
          </Interaction.H2>
          <SignIn />
        </div>
      ) : !me.accessCampaigns ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            <strong>{t('Account/Access/Campaigns/becomeMamber/title')}</strong>
          </Interaction.H2>
          <Link
            href={{
              pathname: '/angebote',
              query: { package: 'ABO' },
            }}
            passHref
          >
            <PackageItem
              t={t}
              crowdfundingName={CROWDFUNDING}
              name='ABO'
              hover={hover}
              setHover={setHover}
              price={24000}
            />
          </Link>
        </div>
      ) : null}
    </Frame>
  )
}

export default withDefaultSSR(compose(withMembership, withT)(Page))

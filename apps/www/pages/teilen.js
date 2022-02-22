import React, { useState } from 'react'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import withT from '../lib/withT'
import { CROWDFUNDING } from '../lib/constants'
import { useMe } from '../lib/context/MeContext'
import { PackageBuffer, PackageItem } from '../components/Pledge/Accordion'
import AccessCampaigns from '../components/Access/Campaigns'
import ShareChart from '../components/Access/Campaigns/ShareChart'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'

const meta = {
  title: t('pages/access/title'),
}

const Page = ({ t }) => {
  const [hover, setHover] = useState()
  const { me } = useMe()
  return (
    <Frame meta={meta}>
      <ShareChart />
      <AccessCampaigns />
      {!me ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            {t('Account/Access/Campaigns/login/title')}
          </Interaction.H2>
          <SignIn />
        </div>
      ) : !me.activeMembership ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2 style={{ marginBottom: 10 }}>
            {t('Account/Access/Campaigns/becomeMamber/title')}
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
          <PackageBuffer />
        </div>
      ) : null}
    </Frame>
  )
}

export default withDefaultSSR(compose(withT)(Page))

import React, { useState } from 'react'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t, useTranslation } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import { CROWDFUNDING } from '../lib/constants'
import { useMe } from '../lib/context/MeContext'
import { PackageBuffer, PackageItem } from '../components/Pledge/Accordion'
import AccessCampaigns from '../components/Access/Campaigns'
import ShareChart from '../components/Access/Campaigns/ShareChart'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'
import { useInNativeApp } from '../lib/withInNativeApp'

const meta = {
  title: t('pages/access/title'),
}

const Page = () => {
  const { inNativeIOSApp } = useInNativeApp()
  const { t } = useTranslation()
  const { me } = useMe()
  const [hover, setHover] = useState()

  return (
    <Frame meta={meta}>
      <ShareChart />
      <AccessCampaigns />
      {!me && (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            {t('Account/Access/Campaigns/login/title')}
          </Interaction.H2>
          <SignIn />
        </div>
      )}
      {me && !me.activeMembership && !inNativeIOSApp && (
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
          <Link
            href={{
              pathname: '/angebote',
              query: { package: 'MONTHLY_ABO' },
            }}
            passHref
          >
            <PackageItem
              t={t}
              crowdfundingName={CROWDFUNDING}
              name='MONTHLY_ABO'
              hover={hover}
              setHover={setHover}
              price={2200}
            />
          </Link>
          <PackageBuffer />
        </div>
      )}
    </Frame>
  )
}

export default withDefaultSSR(Page)

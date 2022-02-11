import React, { useState } from 'react'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import { CROWDFUNDING } from '../lib/constants'
import useInNativeApp from '../lib/withInNativeApp'
import { withMembership } from '../components/Auth/checkRoles'

import { PackageItem, PackageBuffer } from '../components/Pledge/Accordion'
import AccessCampaigns from '../components/Access/Campaigns'
import ShareChart from '../components/Access/Campaigns/ShareChart'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'

const meta = {
  title: t('pages/access/title'),
}

const Page = ({ me, isMember, hasActiveMembership }) => {
  const [hover, setHover] = useState()

  return (
    <Frame meta={meta}>
      <Interaction.H2>
        <strong>Republik Teilen</strong>
      </Interaction.H2>
      <Interaction.P>Beschrieb</Interaction.P>
      <ShareChart />
      <AccessCampaigns />
      {!me && (
        <>
          <Interaction.H2>
            <strong>Einloggen und Abo Teilen</strong>
          </Interaction.H2>
          <SignIn />
        </>
      )}

      {/* TODO: add prolong*/}
      {!isMember && (
        <>
          <Interaction.H2>
            <strong>Noch nicht Mitglied?</strong>
          </Interaction.H2>
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
        </>
      )}
    </Frame>
  )
}

export default withDefaultSSR(compose(withMembership)(Page))

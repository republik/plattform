import React, { useState } from 'react'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t } from '../lib/withT'
import withDefaultSSR from '../lib/hocs/withDefaultSSR'
import withT from '../lib/withT'
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

const Page = ({ me, t }) => {
  const [hover, setHover] = useState()

  return (
    <Frame meta={meta}>
      <Interaction.H2>
        <strong>{t('Share/title')}</strong>
      </Interaction.H2>
      <Interaction.P>{t('Share/lead')}</Interaction.P>
      {/* e3568e03-b6b3-46c5-b07a-e9afeea92023 "Teilen Sie Ihr Abonnement" */}
      <ShareChart accessCampaignId='e3568e03-b6b3-46c5-b07a-e9afeea92023' />
      <AccessCampaigns />
      {/* TODO: add prolong*/}
      {!me ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            <strong>Einloggen und Abo schenken</strong>
          </Interaction.H2>
          <SignIn />
        </div>
      ) : !me.accessCampaigns ? (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2>
            <strong>Mitglied werden und Abo Teilen</strong>
          </Interaction.H2>
          <Interaction.P>
            <strong>
              Mit einer Republik Mitgliedschaft können Sie ihr Abo für x Wochem
              mit anderen Leuten teilen
            </strong>
          </Interaction.P>
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

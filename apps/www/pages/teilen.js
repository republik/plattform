import { useState } from 'react'
import Link from 'next/link'
import { Interaction } from '@project-r/styleguide'

import { t, useTranslation } from '../lib/withT'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { CROWDFUNDING } from '../lib/constants'
import { useMe } from '../lib/context/MeContext'
import { PackageBuffer, PackageItem } from '../components/Pledge/Accordion'
import AccessCampaigns from '../components/Access/Campaigns'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'
import { useInNativeApp } from '../lib/withInNativeApp'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'

const meta = {
  title: t('pages/access/title'),
  description: t('pages/access/description'),
  image: `${CDN_FRONTEND_BASE_URL}/static/social-media/teilen.png`,
}

const Page = () => {
  const { inNativeIOSApp } = useInNativeApp()
  const { t } = useTranslation()
  const { me } = useMe()
  const [hover, setHover] = useState()

  return (
    <Frame meta={meta}>
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
            legacyBehavior
          >
            <PackageItem
              t={t}
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
            legacyBehavior
          >
            <PackageItem
              t={t}
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

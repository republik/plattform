import { Interaction } from '@project-r/styleguide'

import { t, useTranslation } from '../lib/withT'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { useMe } from '../lib/context/MeContext'
import AccessCampaigns from '../components/Access/Campaigns'
import Frame from '../components/Frame'
import SignIn from '../components/Auth/SignIn'
import { useInNativeApp } from '../lib/withInNativeApp'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { Offers } from '@app/components/paynotes/paynote/paynote-offers'

const meta = {
  title: t('pages/access/title'),
  description: t('pages/access/description'),
  image: `${CDN_FRONTEND_BASE_URL}/static/social-media/teilen.png`,
}

const Page = () => {
  const { inNativeIOSApp } = useInNativeApp()
  const { t } = useTranslation()
  const { me, hasActiveMembership } = useMe()

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
      {me && !hasActiveMembership && !inNativeIOSApp && (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2 style={{ marginBottom: 36 }}>
            {t('Account/Access/Campaigns/becomeMamber/title')}
          </Interaction.H2>
          <Offers />
        </div>
      )}
    </Frame>
  )
}

export default withDefaultSSR(Page)

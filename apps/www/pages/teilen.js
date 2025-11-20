import { Offers } from '@app/components/paynotes/paynote/paynote-offers'
import { Interaction } from '@project-r/styleguide'
import AccessCampaigns from '../components/Access/Campaigns'
import SignIn from '../components/Auth/SignIn'
import Frame from '../components/Frame'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { CDN_FRONTEND_BASE_URL } from '../lib/constants'
import { useMe } from '../lib/context/MeContext'
import { useInNativeApp } from '../lib/withInNativeApp'

import { t, useTranslation } from '../lib/withT'

const meta = {
  title: t('pages/access/title'),
  description: t('pages/access/description'),
  image: `${CDN_FRONTEND_BASE_URL}/static/social-media/teilen.png`,
}

const Page = () => {
  const { inNativeApp } = useInNativeApp()
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
      {me && !hasActiveMembership && !inNativeApp && (
        <div style={{ marginTop: 36 }}>
          <Interaction.H2 style={{ marginBottom: 36 }}>
            {t('Account/Access/Campaigns/becomeMember/title')}
          </Interaction.H2>
          <Offers />
        </div>
      )}
    </Frame>
  )
}

export default withDefaultSSR(Page)

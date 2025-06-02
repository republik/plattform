import { useRouter } from 'next/router'

import { useTranslation } from '../lib/withT'

import Cancel from '../components/Account/Memberships/Cancel'
import SignIn from '../components/Auth/SignIn'
import Frame from '../components/Frame'

import { Interaction } from '@project-r/styleguide'
import { useMe } from 'lib/context/MeContext'
import { withDefaultSSR } from '../lib/apollo/helpers'
import { CancelMagazineSubscription } from 'components/Account/Memberships/CancelMagazineSubscription'

const CancelMembershipPage = () => {
  const {
    query: { membershipId },
  } = useRouter()
  const { me } = useMe()
  const { t } = useTranslation()

  const meta = {
    title: t('memberships/cancel/title'),
    description: '',
  }

  return (
    <Frame meta={meta}>
      {me ? (
        me.activeMagazineSubscription ? (
          <CancelMagazineSubscription
            subscriptionId={me.activeMagazineSubscription.id}
          />
        ) : (
          <Cancel membershipId={membershipId} />
        )
      ) : (
        <>
          <Interaction.H1>{meta.title}</Interaction.H1>
          <br />
          <SignIn
            context='cancel'
            beforeForm={
              <Interaction.P style={{ marginBottom: 20 }}>
                {t('memberships/cancel/signIn')}
              </Interaction.P>
            }
          />
        </>
      )}
    </Frame>
  )
}

export default withDefaultSSR(CancelMembershipPage)

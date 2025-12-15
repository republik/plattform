import { AccountPaynote } from '@app/components/paynotes/paynotes-in-trial/account'
import { A, Interaction, mediaQueries } from '@project-r/styleguide'

import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import AccountSection from '../../components/Account/AccountSection'
import AccountTabs from '../../components/Account/AccountTabs'
import { AccountEnforceMe, HintArea } from '../../components/Account/Elements'
import Memberships from '../../components/Account/Memberships'
import UpdateEmail, { UserEmail } from '../../components/Account/UserInfo/Email'
import NameAddress from '../../components/Account/UserInfo/NameAddress'
import Frame from '../../components/Frame'
import Merci from '../../components/Pledge/Merci'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import { useMe } from '../../lib/context/MeContext'
import { useTranslation } from '../../lib/withT'
import { EventTrackingContext } from '../../src/lib/analytics/event-tracking'

const { Emphasis } = Interaction

const styles = {
  container: css({
    display: 'flex',
    flexDirection: 'column',
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      gap: 32,
    },
  }),
  column: css({ flex: 1 }),
}

const AccountPage = () => {
  const { t } = useTranslation()
  const { trialStatus, hasActiveMembership } = useMe()
  const meta = {
    title: t('pages/account/title'),
  }
  const router = useRouter()
  const { query } = router
  const postPledge = query.id || query.claim

  useEffect(() => {
    // client side redirect for old urls
    switch (window.location.hash) {
      case '#newsletter':
        router.replace('/konto/newsletter')
        break
      case '#anmeldung':
        router.replace('/konto/einstellungen#anmeldung')
        break
      case '#position':
        router.replace('/konto/einstellungen#position')
        break
    }
  }, [])

  const account = (
    <AccountEnforceMe>
      <EventTrackingContext category='Account'>
        <AccountTabs />

        {trialStatus.includes('TRIAL_GROUP') && (
          <div style={{ margin: '24px 0' }}>
            <AccountPaynote />
          </div>
        )}

        <Memberships />
        <AccountSection id='account' title={t('Account/Update/title')}>
          <div style={{ marginBottom: 24 }}>
            <UserEmail />
            <UpdateEmail />
          </div>
          <NameAddress />
        </AccountSection>
        <div {...styles.column}>
          <AccountSection id='delete' title={t('Account/Delete/title')}>
            <HintArea>
              {t.elements('Account/Delete/text', {
                link: (
                  <Link
                    key='link'
                    href='/datenschutz-loeschungsanfrage'
                    passHref
                    legacyBehavior
                  >
                    <A>
                      <Emphasis>{t('Account/Delete/link')}</Emphasis>
                    </A>
                  </Link>
                ),
              })}
            </HintArea>
          </AccountSection>
        </div>
      </EventTrackingContext>
    </AccountEnforceMe>
  )

  return (
    <Frame meta={meta}>
      {postPledge ? <Merci query={query}>{account}</Merci> : account}
    </Frame>
  )
}

export default withDefaultSSR(AccountPage)

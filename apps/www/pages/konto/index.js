import { useEffect } from 'react'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { mediaQueries, A, Interaction } from '@project-r/styleguide'

import Frame from '../../components/Frame'
import Merci from '../../components/Pledge/Merci'
import withT from '../../lib/withT'
import { withDefaultSSR } from '../../lib/apollo/helpers'
import AccountTabs from '../../components/Account/AccountTabs'
import AccountSection from '../../components/Account/AccountSection'
import Memberships from '../../components/Account/Memberships'
import { HintArea, AccountEnforceMe } from '../../components/Account/Elements'
import NameAddress from '../../components/Account/UserInfo/NameAddress'
import UpdateEmail, { UserEmail } from '../../components/Account/UserInfo/Email'
import withMe from '../../lib/apollo/withMe'

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

const AccountPage = ({ t, hasAccess, hasActiveMembership }) => {
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
      <AccountTabs />
      <div {...styles.container}>
        {hasAccess && (
          <div {...styles.column}>
            <AccountSection
              id='onboarding'
              title={t('Account/Onboarding/title')}
            >
              <HintArea>
                {t.elements('Account/Onboarding/text', {
                  link: (
                    <Link key='link' href='/einrichten' passHref legacyBehavior>
                      <A>
                        <Emphasis>{t('Account/Onboarding/link')}</Emphasis>
                      </A>
                    </Link>
                  ),
                })}
              </HintArea>
            </AccountSection>
          </div>
        )}

        {hasActiveMembership && (
          <div {...styles.column}>
            <AccountSection
              id='teilen'
              title={t('Account/Access/Campaigns/title')}
            >
              <HintArea>
                {t.elements('Account/Access/text', {
                  link: (
                    <Link key='link' href='/teilen' passHref legacyBehavior>
                      <A>
                        <Emphasis>{t('Account/Access/link')}</Emphasis>
                      </A>
                    </Link>
                  ),
                })}
              </HintArea>
            </AccountSection>
          </div>
        )}
      </div>
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
    </AccountEnforceMe>
  )

  return (
    <Frame meta={meta}>
      {postPledge ? <Merci query={query}>{account}</Merci> : account}
    </Frame>
  )
}

export default withDefaultSSR(compose(withT, withMe)(AccountPage))

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'

import withT from '../../../lib/withT'
import { useInNativeApp } from '../../../lib/withInNativeApp'

import Loader from '../../Loader'
import UserGuidance from '../UserGuidance'

import AccessGrants from '../../Access/Grants'
import withMembership from '../../Auth/withMembership'
import Box from '../../Frame/Box'

import belongingsQuery from '../belongingsQuery'
import MembershipList from '../Memberships/List'
import PaymentSources from '../PaymentSources'
import AccountSection from '../AccountSection'
import { Interaction } from '@project-r/styleguide'
import GotoLinkBlocker from '../../NativeApp/GotoLinkBlocker'

const AccountBox = ({ children }) => {
  return <Box style={{ padding: 14, marginBottom: 20 }}>{children}</Box>
}

const Memberships = ({
  loading,
  error,
  t,
  hasMemberships,
  hasActiveMemberships,
  hasAccessGrants,
  paymentMethodCompany,
  paymentMethods,
}) => {
  const { query } = useRouter()

  useEffect(() => {
    if (window.location.hash.substr(1).length > 0) {
      const node = document.getElementById(window.location.hash.substr(1))

      if (node) {
        node.scrollIntoView()
      }
    }
  }, [])

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const GotoMessage = (
          <Interaction.P>
            Ihre Zahlungsart können Sie in der App nicht verwalten.
          </Interaction.P>
        )

        return (
          <>
            {hasAccessGrants && !hasActiveMemberships && (
              <AccountBox>
                <AccessGrants />
              </AccountBox>
            )}
            {!hasAccessGrants && !hasMemberships && (
              <AccountBox>
                <UserGuidance />
              </AccountBox>
            )}
            <MembershipList highlightId={query.id} />
            {paymentMethods && (
              <AccountSection
                id='payment'
                title={t('memberships/title/payment')}
              >
                <GotoLinkBlocker message={GotoMessage}>
                  <PaymentSources
                    company={paymentMethodCompany}
                    methods={paymentMethods}
                    query={query}
                  />
                </GotoLinkBlocker>
              </AccountSection>
            )}
          </>
        )
      }}
    />
  )
}

export default compose(
  withT,
  withMembership,
  graphql(belongingsQuery, {
    props: ({ data }) => {
      const isReady = !data.loading && !data.error && data.me
      const hasMemberships =
        isReady && data.me.memberships && !!data.me.memberships.length
      const hasActiveMemberships =
        isReady && hasMemberships && data.me.memberships.some((m) => m.active)
      const monthlyMembership =
        isReady &&
        hasMemberships &&
        data.me.memberships.find((m) => m.type.name === 'MONTHLY_ABO')
      const hasAccessGrants =
        isReady && data.me.accessGrants && !!data.me.accessGrants.length
      const autoPayMembership =
        (hasMemberships &&
          data.me.memberships.find(
            (m) =>
              m.active &&
              m.renew &&
              (m.type.name === 'MONTHLY_ABO' || m.autoPay),
          )) ||
        (!hasActiveMemberships && monthlyMembership)

      const paymentMethodCompany =
        autoPayMembership && autoPayMembership.pledge.package.company
      const paymentMethods =
        autoPayMembership && autoPayMembership.pledge.package.paymentMethods

      return {
        loading: data.loading,
        error: data.error,
        hasMemberships,
        hasActiveMemberships,
        hasAccessGrants,
        paymentMethodCompany,
        paymentMethods,
      }
    },
  }),
)(Memberships)

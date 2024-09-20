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

import { Interaction } from '@project-r/styleguide'

import belongingsQuery from '../belongingsQuery'
import MembershipList from '../Memberships/List'
import PaymentSources from '../PaymentSources'
import AccountSection from '../AccountSection'
import SubscriptionItem from './SubscriptionItem'

const { P } = Interaction

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
  magazineSubscriptions,
  activeMagazineSubscription,
}) => {
  const { query } = useRouter()
  const { inNativeIOSApp } = useInNativeApp()

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
            {inNativeIOSApp && (
              <AccountBox>
                <P>{t('account/ios/box')}</P>
              </AccountBox>
            )}

            {/* Account Section, hide in iOS */}
            {!inNativeIOSApp &&
              (magazineSubscriptions.length > 0 ? (
                <AccountSection id='abos' title={t('memberships/title/1')}>
                  <SubscriptionItem subscription={activeMagazineSubscription} />
                </AccountSection>
              ) : (
                <>
                  <MembershipList highlightId={query.id} />
                  {paymentMethodCompany && (
                    <AccountSection
                      id='payment'
                      title={t('memberships/title/payment')}
                    >
                      <PaymentSources
                        company={paymentMethodCompany}
                        query={query}
                      />
                    </AccountSection>
                  )}
                </>
              ))}
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

      console.log(data.me)

      const hasMemberships =
        isReady &&
        (!!data.me.memberships?.length ||
          !!data.me.magazineSubscriptions?.length)
      const hasActiveMemberships =
        isReady &&
        hasMemberships &&
        (data.me.memberships.some((m) => m.active) ||
          !!data.me.activeMagazineSubscription)
      const monthlyMembership =
        isReady &&
        hasMemberships &&
        (data.me.memberships.find((m) => m.type.name === 'MONTHLY_ABO') ||
          data.me.activeMagazineSubscription?.type === 'MONTHLY_SUBSCRIPTION')
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
        (autoPayMembership && autoPayMembership.pledge.package.company) ||
        data.me?.activeMagazineSubscription?.company

      const magazineSubscriptions = data?.me?.magazineSubscriptions
      const activeMagazineSubscription = data?.me?.activeMagazineSubscription
      return {
        loading: data.loading,
        error: data.error,
        hasMemberships,
        hasActiveMemberships,
        hasAccessGrants,
        paymentMethodCompany,
        magazineSubscriptions,
        activeMagazineSubscription,
      }
    },
  }),
)(Memberships)

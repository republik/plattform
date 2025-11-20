import { MyBelongingsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { graphql } from '@apollo/client/react/hoc'

import { useColorContext } from '@project-r/styleguide'
import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'

import { useEffect } from 'react'
import { useInNativeApp } from '../../../lib/withInNativeApp'

import withT from '../../../lib/withT'

import withMembership from '../../Auth/withMembership'

import Loader from '../../Loader'
import AccountSection from '../AccountSection'

import MembershipList from '../Memberships/List'
import PaymentSources from '../PaymentSources'
import UserGuidance from '../UserGuidance'
import { ManageMagazineSubscription } from './ManageMagazineSubscription'

const Memberships = ({
  loading,
  error,
  t,
  hasActiveMemberships,
  hasAccessGrants,
  paymentMethodCompany,
  activeMagazineSubscription,
}) => {
  const { query } = useRouter()
  const [colorScheme] = useColorContext()
  const { inNativeApp } = useInNativeApp()

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
            {!hasAccessGrants && !hasActiveMemberships && (
              <div
                {...colorScheme.set('backgroundColor', 'hover')}
                style={{
                  padding: 14,
                  marginBottom: 20,
                }}
              >
                <UserGuidance />
              </div>
            )}

            {activeMagazineSubscription ? (
              // If user has active magazine subscription, we need to show the info.
              <ManageMagazineSubscription
                subscription={activeMagazineSubscription}
              />
            ) : hasActiveMemberships ? (
              // If user has *other* active memberships
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
            ) : null}
          </>
        )
      }}
    />
  )
}

export default compose(
  withT,
  withMembership,
  graphql(MyBelongingsDocument, {
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

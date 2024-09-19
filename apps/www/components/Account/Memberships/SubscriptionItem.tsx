import { useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { useRouter } from 'next/router'

import { Interaction, InlineSpinner, A } from '@project-r/styleguide'
import withT from '../../../lib/withT'
import { errorToString } from '../../../lib/utils/errors'
import { EditButton } from '../Elements'

type MagazineSubscription = {
  type: 'YEARLY_SUBSCRIPTION' | 'MONTHLY_SUBSCRIPTION'
  renewsAtPrice: number
  currentPeriodEnd?: Date
  cancelAt?: Date
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'paused'
  paymentMethod: string
  company: 'PROJECT_R' | 'REPUBLIK'
}

const SubscriptionItem = ({
  subscription,
  t,
}: {
  subscription: MagazineSubscription
  t: (arg1: any, arg2?: any) => string
}) => {
  return (
    <>
      {!subscription ? (
        <>
          <Interaction.H3 style={{ marginBottom: 8 }}>
            {t('magazineSubscription/noActiveSubscription')}
          </Interaction.H3>
          <Interaction.P>
            <A
              href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot/MONTHLY`}
            >
              {t('magazineSubscription/shoplink/MONTHLY')}
            </A>
            {' oder '}
            <A href={`${process.env.NEXT_PUBLIC_SHOP_BASE_URL}/angebot/YEARLY`}>
              {t('magazineSubscription/shoplink/YEARLY')}
            </A>
            {' kaufen.'}
          </Interaction.P>
        </>
      ) : (
        <>
          <Interaction.H3 style={{ marginBottom: 8 }}>
            {`${t(`magazineSubscription/title/${subscription.type}`)} ${
              subscription.cancelAt ? `${t('magazineSubscription/title/canceled')}` : ''
            }`}
          </Interaction.H3>
          {subscription.cancelAt ? (
            <>
              <Interaction.P>
                {t(`magazineSubscription/canceled/${subscription.type}`, {
                  cancelAt: new Date(subscription.cancelAt).toLocaleDateString('de-CH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                })}
              </Interaction.P>
            </>
          ) : (
            <>
              <Interaction.P>
                {t('magazineSubscription/description', {
                  currentPeriodEnd: new Date(
                    subscription.currentPeriodEnd,
                  ).toLocaleDateString('de-CH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }),
                  renewsAtPrice: subscription.renewsAtPrice / 100,
                })}
              </Interaction.P>
              <Interaction.P>
                {t('magazineSubscription/paymentMethod', {
                  paymentMethod: subscription.paymentMethod,
                })}
              </Interaction.P>
            </>
          )}
          <CustomerPortalLink subscription={subscription} t={t} />
        </>
      )}
    </>
  )
}

const createStripeCustomerPortalSessionMutation = gql`
  mutation createStripeCustomerPortalSession($companyName: CompanyName!) {
    createStripeCustomerPortalSession(companyName: $companyName) {
      sessionUrl
    }
  }
`

const CustomerPortalLink = compose(
  graphql(createStripeCustomerPortalSessionMutation, {
    props: ({ mutate }) => ({
      createStripeCustomerPortalSession: (companyName) => {
        return mutate({
          variables: {
            companyName,
          },
        })
      },
    }),
  }),
)(({ createStripeCustomerPortalSession, subscription, t }) => {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  return (
    <EditButton
      onClick={(e) => {
        e.preventDefault()
        setLoading(true)
        createStripeCustomerPortalSession(subscription.company)
          .then(({ data }) => {
            router.push(data.createStripeCustomerPortalSession.sessionUrl)
            setLoading(false)
          })
          .catch(errorToString)
      }}
    >
      <span
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}
      >
        {t(`magazineSubscription/customerPortalLink/${subscription.type}`)}
        {loading ? <InlineSpinner size={16} /> : null}
      </span>
    </EditButton>
  )
})

export default compose(withT)(SubscriptionItem)

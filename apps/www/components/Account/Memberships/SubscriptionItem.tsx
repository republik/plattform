import { gql, useMutation } from '@apollo/client'
import { graphql } from '@apollo/client/react/hoc'
import compose from 'lodash/flowRight'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  CancellationCategoryType,
  CancelMagazineSubscriptionDocument,
  MyBelongingsQuery,
  ReactivateMagazineSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { InlineSpinner, Interaction, mediaQueries } from '@project-r/styleguide'
import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'
import { EditButton } from '../Elements'
import { css } from 'glamor'

type MagazineSubscription = NonNullable<
  MyBelongingsQuery['me']['activeMagazineSubscription']
>

export function SubscriptionItem({
  subscription,
}: {
  subscription: MagazineSubscription | undefined
}) {
  const [reactivateSubscription] = useMutation(
    ReactivateMagazineSubscriptionDocument,
  )

  const [cancelSubscription] = useMutation(CancelMagazineSubscriptionDocument)

  const { t } = useTranslation()

  return (
    <div
      {...css({
        display: 'flex',
        flexDirection: 'column',
        gap: 4,

        marginBottom: 36,
        [mediaQueries.mUp]: {
          marginBottom: 48,
        },
      })}
    >
      <Interaction.H3 style={{ marginBottom: 8 }}>
        {`${t(`magazineSubscription/title/${subscription.type}`)} ${
          subscription.cancelAt
            ? `${t('magazineSubscription/title/canceled')}`
            : ''
        }`}
      </Interaction.H3>
      {subscription.cancelAt ? (
        <>
          <Interaction.P>
            {t(`magazineSubscription/canceled/${subscription.type}`, {
              cancelAt: new Date(subscription.cancelAt).toLocaleDateString(
                'de-CH',
                {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                },
              ),
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
            })}{' '}
          </Interaction.P>
        </>
      )}

      <div>
        <CustomerPortalLink subscription={subscription} t={t} />
      </div>

      <div>
        {subscription.canceledAt ? (
          !subscription.endedAt && (
            <EditButton
              onClick={() => {
                reactivateSubscription({
                  variables: { subscriptionId: subscription.id },
                })
                  .then((res) => {
                    console.log(res)
                  })
                  .catch((err) => {
                    console.log(err)
                  })
              }}
            >
              {t(`magazineSubscription/reactivate/${subscription.type}`)}
            </EditButton>
          )
        ) : (
          <EditButton
            onClick={() => {
              cancelSubscription({
                variables: {
                  subscriptionId: subscription.id,
                  details: {
                    type: CancellationCategoryType.Other,
                  },
                },
              })
                .then((res) => {
                  console.log(res)
                })
                .catch((err) => {
                  console.log(err)
                })
            }}
          >
            {t(`magazineSubscription/cancel/${subscription.type}`)}
          </EditButton>
        )}
      </div>
    </div>
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
        {t(`magazineSubscription/paymentMethod/change`)}
        {loading ? <InlineSpinner size={16} /> : null}
      </span>
    </EditButton>
  )
})

import {
  ActiveMagazineSubscriptionDocument,
  CreateStripeCustomerPortalSessionDocument,
  ReactivateMagazineSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import {
  BabySpinner,
  Interaction,
  linkRule,
  mediaQueries,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'
import { EditButton } from '../Elements'

export function ManageMagazineSubscription() {
  const { data, startPolling, stopPolling } = useQuery(
    ActiveMagazineSubscriptionDocument,
    { fetchPolicy: 'cache-and-network' },
  )

  const [reactivateSubscription] = useMutation(
    ReactivateMagazineSubscriptionDocument,
  )

  const [isPolling, setIsPolling] = useState(false)

  const subscription = data?.me?.activeMagazineSubscription

  const { t } = useTranslation()

  // Subscriptions don't update immediately after being canceled/reactivated, so we start polling instead of refetching immediately
  const refetchSubscriptions = () => {
    // console.log('start polling subscriptions')
    startPolling(1000)
    setIsPolling(true)
  }

  // ... and stop when changed data comes in (if the data hasn't changed yet, it's still
  // in the Apollo Client cache and will not trigger the effect)
  useEffect(() => {
    // console.log('stop polling subscriptions')
    if (data) {
      console.log(data)
      stopPolling()
      setIsPolling(false)
    }
  }, [data, stopPolling])

  if (!subscription) {
    return null
  }

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
              renewsAtPrice: (subscription.renewsAtPrice / 100).toFixed(2),
            })}
          </Interaction.P>
          <Interaction.P>
            {t('magazineSubscription/paymentMethod', {
              paymentMethod: subscription.paymentMethod,
            })}{' '}
          </Interaction.P>
        </>
      )}

      {subscription.canceledAt ? (
        !subscription.endedAt && (
          <div>
            <EditButton
              onClick={() => {
                if (!isPolling) {
                  reactivateSubscription({
                    variables: { subscriptionId: subscription.id },
                  }).then(refetchSubscriptions)
                }
              }}
            >
              {t(`magazineSubscription/reactivate/${subscription.type}`)}{' '}
              {isPolling && <BabySpinner />}
            </EditButton>
          </div>
        )
      ) : (
        <>
          <div>
            <CustomerPortalLink subscription={subscription} />
          </div>
          <div>
            <Link {...css({ ...linkRule })} href='/abgang'>
              {t(`magazineSubscription/cancel/${subscription.type}`)}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}

const CustomerPortalLink = ({ subscription }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const [createStripeCustomerPortalSession, { loading }] = useMutation(
    CreateStripeCustomerPortalSessionDocument,
  )

  return (
    <EditButton
      onClick={(e) => {
        e.preventDefault()
        createStripeCustomerPortalSession({
          variables: { companyName: subscription.company },
        })
          .then(({ data }) => {
            router.push(data.createStripeCustomerPortalSession.sessionUrl)
          })
          .catch(errorToString)
      }}
    >
      <span
        style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8 }}
      >
        {t(`magazineSubscription/paymentMethod/change`)}
        {loading && <BabySpinner />}
      </span>
    </EditButton>
  )
}

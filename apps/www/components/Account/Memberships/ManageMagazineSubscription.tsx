import {
  CreateStripeCustomerPortalSessionDocument,
  MyBelongingsQuery,
  ReactivateMagazineSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation } from '@apollo/client'
import {
  InlineSpinner,
  Interaction,
  linkRule,
  mediaQueries,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'
import { EditButton } from '../Elements'

type MagazineSubscription = NonNullable<
  MyBelongingsQuery['me']['activeMagazineSubscription']
>

export function ManageMagazineSubscription({
  subscription,
}: {
  subscription: MagazineSubscription | undefined
}) {
  const [reactivateSubscription] = useMutation(
    ReactivateMagazineSubscriptionDocument,
  )

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
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useTranslation()

  const [createStripeCustomerPortalSession] = useMutation(
    CreateStripeCustomerPortalSessionDocument,
  )

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
}

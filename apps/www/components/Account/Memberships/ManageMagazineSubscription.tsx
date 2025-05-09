import {
  ActiveMagazineSubscriptionDocument,
  CreateStripeCustomerPortalSessionDocument,
  ReactivateMagazineSubscriptionDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import {
  BabySpinner,
  Button,
  Field,
  fontStyles,
  Interaction,
  linkRule,
  mediaQueries,
  Overlay,
  OverlayBody,
  OverlayToolbar,
} from '@project-r/styleguide'
import { css } from 'glamor'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { errorToString } from '../../../lib/utils/errors'
import { useTranslation } from '../../../lib/withT'
import { EditButton } from '../Elements'
import { FormField } from '@app/components/ui/form'

const styles = {
  tableCell: css({
    ...fontStyles.sansSerifRegular16,
    textAlign: 'left',
    paddingBlock: 4,
    paddingInline: 16,

    '&:first-child': {
      paddingInlineStart: 0,
    },

    '&:last-child': {
      paddingInlineEnd: 0,
      textAlign: 'right',
    },
  }),
}

export function ManageMagazineSubscription() {
  const { data, startPolling, stopPolling } = useQuery(
    ActiveMagazineSubscriptionDocument,
    // make sure that up-to-date information is shown when user navigates back from /abgang
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

          {subscription.items.length > 1 && (
            <table
              {...css({
                width: '100%',
                maxWidth: 'max-content',
              })}
            >
              <tbody>
                {subscription.items.map(({ id, amount, label }) => {
                  return (
                    <tr key={id}>
                      <th scope='row' {...styles.tableCell}>
                        {label}
                      </th>
                      <td {...styles.tableCell}>
                        CHF {(amount / 100).toFixed(2)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          <div>
            <Link {...css({ ...linkRule })} href='/abgang'>
              {t(`magazineSubscription/cancel/${subscription.type}`)}
            </Link>
          </div>
          <div>
            <UpdateDonationLink subscription={subscription} />
          </div>

          <Interaction.H3 {...css({ marginTop: 20 })}>
            {t('magazineSubscription/paymentMethod', {
              paymentMethod: subscription.paymentMethod,
            })}
          </Interaction.H3>

          <div>
            <CustomerPortalLink subscription={subscription} />
          </div>
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
        <></>
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
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {t(`magazineSubscription/paymentMethod/change`)}
        {loading && <BabySpinner />}
      </span>
    </EditButton>
  )
}

const UpdateDonationLink = ({ subscription }) => {
  const router = useRouter()
  const { t } = useTranslation()

  const [showOverlay, setShowOverlay] = useState(false)

  // const [createStripeCustomerPortalSession, { loading }] = useMutation(
  //   CreateStripeCustomerPortalSessionDocument,
  // )

  return (
    <>
      <EditButton
        onClick={(e) => {
          e.preventDefault()
          setShowOverlay(true)
          // createStripeCustomerPortalSession({
          //   variables: { companyName: subscription.company },
          // })
          //   .then(({ data }) => {
          //     router.push(data.createStripeCustomerPortalSession.sessionUrl)
          //   })
          //   .catch(errorToString)
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {t(`magazineSubscription/updateDonation`)}
        </span>
      </EditButton>
      {showOverlay && (
        <Overlay onClose={() => setShowOverlay(false)}>
          <OverlayToolbar
            onClose={() => setShowOverlay(false)}
            title={t(`magazineSubscription/updateDonation`)}
          />

          <OverlayBody>
            <form
              onSubmit={(e) => {
                const data = Object.fromEntries(
                  new FormData(
                    e.currentTarget,
                    // Pass the submitter (= the button that was used to submit the form), so its value is available in the FormData
                    (e.nativeEvent as SubmitEvent).submitter,
                  ),
                )

                console.log(data)

                e.preventDefault()
              }}
            >
              <Field label='Betrag' name='donationAmount' />

              <Button type='submit' primary>
                Ändern
              </Button>
              <button type='submit' name='donationAmount' value='0' naked small>
                Spende kündigen
              </button>
            </form>
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

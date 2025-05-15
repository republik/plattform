import {
  ActiveMagazineSubscriptionDocument,
  ActiveMagazineSubscriptionQuery,
  CreateStripeCustomerPortalSessionDocument,
  ReactivateMagazineSubscriptionDocument,
  UpdateMagazineSubscriptionDonationDocument,
} from '#graphql/republik-api/__generated__/gql/graphql'
import { useMutation, useQuery } from '@apollo/client'
import {
  BabySpinner,
  Button,
  Field,
  fontStyles,
  Interaction,
  linkRule,
  Loader,
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

type MagazineSubscription = NonNullable<
  ActiveMagazineSubscriptionQuery['me']['activeMagazineSubscription']
>

export function ManageMagazineSubscription() {
  const { data, startPolling, stopPolling, refetch } = useQuery(
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

          <Interaction.P {...css(fontStyles.sansSerifRegular16)}>
            {subscription.donation
              ? t('magazineSubscription/donation/label', {
                  amount: (subscription.donation.amount / 100).toFixed(2),
                })
              : t('magazineSubscription/donation/wannaGiveMore')}{' '}
            <UpdateDonationLink
              subscription={subscription}
              onUpdate={refetch}
            />
          </Interaction.P>

          <div>
            <Link {...css({ ...linkRule })} href='/abgang'>
              {t(`magazineSubscription/cancel/${subscription.type}`)}
            </Link>
          </div>
          <div></div>

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

const CustomerPortalLink = ({
  subscription,
}: {
  subscription: MagazineSubscription
}) => {
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

const UpdateDonationLink = ({
  subscription,
  onUpdate,
}: {
  subscription: MagazineSubscription
  onUpdate: () => void
}) => {
  const { t } = useTranslation()

  const [showOverlay, setShowOverlay] = useState(false)
  const [customAmount, setCustomAmount] = useState('')

  const [updateDonation, { loading, error, reset }] = useMutation(
    UpdateMagazineSubscriptionDonationDocument,
    {},
  )

  return (
    <>
      <EditButton
        onClick={(e) => {
          e.preventDefault()
          setShowOverlay(true)
        }}
      >
        {subscription.donation
          ? t(`magazineSubscription/donation/update`)
          : t(`magazineSubscription/donation/add`)}
      </EditButton>
      {showOverlay && (
        <Overlay
          onClose={() => {
            setShowOverlay(false)
            reset()
          }}
        >
          <OverlayToolbar
            onClose={() => {
              setShowOverlay(false)
              reset()
            }}
            title={t(`magazineSubscription/donation/choose`)}
          />

          <OverlayBody>
            <Loader
              loading={loading}
              error={error}
              render={() => {
                return (
                  <form
                    onSubmit={(e) => {
                      const formData = new FormData(
                        e.currentTarget,
                        // Pass the submitter (= the button that was used to submit the form), so its value is available in the FormData
                        (e.nativeEvent as SubmitEvent).submitter,
                      )

                      const customAmount = formData
                        .get('customDonationAmount')
                        ?.toString()
                      const amount = formData.get('donationAmount')?.toString()

                      const donationAmount = customAmount
                        ? parseInt(customAmount, 10) * 100
                        : parseInt(amount, 10) ?? undefined

                      if (Number.isInteger(donationAmount)) {
                        updateDonation({
                          variables: {
                            subscriptionId: subscription.id,
                            donationAmount,
                          },
                        }).then(() => {
                          setShowOverlay(false)
                          onUpdate()
                        })
                      }

                      e.preventDefault()
                    }}
                  >
                    <div
                      {...css({
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 16,
                      })}
                    >
                      <Interaction.P
                        {...css({
                          ...fontStyles.sansSerifRegular18,
                          marginBottom: 16,
                        })}
                      >
                        {t('magazineSubscription/donation/note')}
                      </Interaction.P>

                      <Button type='submit' name='donationAmount' value='2000'>
                        CHF +20.00
                      </Button>
                      <Button type='submit' name='donationAmount' value='12000'>
                        CHF +120.00
                      </Button>
                      <Button type='submit' name='donationAmount' value='24000'>
                        CHF +240.00
                      </Button>
                      <Field
                        label='Eigener Betrag'
                        name='customDonationAmount'
                        value={customAmount}
                        onChange={(e) => {
                          setCustomAmount(
                            (e.currentTarget as HTMLInputElement).value,
                          )
                        }}
                      />
                      <Button type='submit' disabled={customAmount === ''}>
                        {t('magazineSubscription/donation/chooseCustom')}
                      </Button>
                      {subscription.donation && (
                        <Button
                          type='submit'
                          name='donationAmount'
                          value='0'
                          naked
                          small
                        >
                          {t('magazineSubscription/donation/remove')}
                        </Button>
                      )}
                    </div>
                  </form>
                )
              }}
            ></Loader>
          </OverlayBody>
        </Overlay>
      )}
    </>
  )
}

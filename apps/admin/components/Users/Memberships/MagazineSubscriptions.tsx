import { UserMagazineSubscriptionsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import { useQuery } from '@apollo/client'
import { colors, linkRule, Loader } from '@project-r/styleguide'
import { IconLink } from '@republik/icons'
import { MagazineSubscriptionActions } from 'components/Users/Memberships/MagazineSubscriptionActions'
import { css } from 'glamor'
import { useTranslation } from 'lib/useT'
import { swissTime } from 'lib/utils/formats'
import { useEffect } from 'react'
import SubscriptionStatusBadge from './SubscriptionStatusBadge'
import { divider } from '@republik/theme/patterns'

const dateTimeFormat = swissTime.format('%d.%m.%Y, %H:%M Uhr')
export const displayDateTime = (rawDate) => {
  return dateTimeFormat(new Date(rawDate))
}

const STRIPE_DOMAIN = 'https://dashboard.stripe.com'
const PROJECT_R_STRIPE_ID = 'acct_18rDG8FHX910KaTH'
const REPUBLIK_STRIPE_ID = 'acct_1BUH9rD5iIOpR5wN'

interface MagazineSubscriptionsProps {
  userId: string
}

export function MagazineSubscriptions(props: MagazineSubscriptionsProps) {
  const { data, loading, error, startPolling, stopPolling } = useQuery(
    UserMagazineSubscriptionsDocument,
    {
      variables: {
        userId: props.userId,
      },
    },
  )

  const { t } = useTranslation()

  // Subscriptions don't update immediately after being canceled/reactivated, so we start polling instead of refetching immediately
  const refetchSubscriptions = () => {
    console.log('start polling subscriptions')
    startPolling(1000)
  }

  // ... and stop when changed data comes in (if the data hasn't changed yet, it's still
  // in the Apollo Client cache and will not trigger the effect)
  useEffect(() => {
    console.log('stop polling subscriptions')
    if (data) {
      stopPolling()
    }
  }, [data, stopPolling])

  return (
    <Loader
      loading={!data || loading}
      error={error}
      render={() => {
        const magazineSubscriptions = data?.user?.magazineSubscriptions ?? []

        if (magazineSubscriptions.length === 0) {
          return null
        }

        return (
          <ul
            {...css({
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',

              '& b': { fontWeight: '500' },
            })}
          >
            {magazineSubscriptions.map((subscription) => {
              return (
                <li
                  key={subscription.stripeId}
                  {...css({
                    padding: '1rem',
                    '&:nth-child(odd)': {
                      background: colors.secondaryBg,
                    },
                  })}
                >
                  <details>
                    <summary
                      {...css({
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        gap: '1rem',
                        cursor: 'pointer',
                      })}
                    >
                      <div
                        {...css({
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        })}
                      >
                        <h4
                          {...css({
                            fontWeight: '500',
                            margin: 0,
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '1.2em',
                            gap: 12,
                          })}
                        >
                          {t(
                            `account/MagazineSubscription/type/${subscription.type}`,
                          )}

                          <SubscriptionStatusBadge
                            status={subscription.status}
                          />
                        </h4>
                        <div {...css({ fontSize: 'small' })}>
                          Erstellt am {displayDateTime(subscription.createdAt)}
                          {subscription.canceledAt && (
                            <>
                              , gekündigt am{' '}
                              {displayDateTime(subscription.canceledAt)}
                            </>
                          )}
                          {subscription.upgrade && (
                            <>
                              , Wechsel durchgeführt am{' '}
                              {displayDateTime(subscription.upgrade.createdAt)}
                            </>
                          )}
                        </div>
                        {subscription.upgrade ? (
                          <div>
                            <>
                              ⬆️ Wechsel zu{' '}
                              {t(
                                `account/MagazineSubscription/type/${subscription.upgrade.subscriptionType}`,
                              )}{' '}
                              am{' '}
                              <b>
                                {displayDateTime(
                                  subscription.upgrade.scheduledStart,
                                )}
                              </b>
                            </>
                          </div>
                        ) : subscription.canceledAt ? (
                          <div>
                            {subscription.endedAt ? (
                              <>
                                ⏹️ Abgelaufen am{' '}
                                <b>{displayDateTime(subscription.endedAt)}</b>
                              </>
                            ) : (
                              <>
                                ⏯️ Läuft ab am{' '}
                                <b>
                                  {displayDateTime(
                                    subscription.currentPeriodEnd,
                                  )}
                                </b>
                              </>
                            )}
                          </div>
                        ) : (
                          <div>
                            🔄 Erneuert sich am{' '}
                            <b>
                              {displayDateTime(subscription.currentPeriodEnd)}
                            </b>{' '}
                            für{' '}
                            <b>
                              CHF{' '}
                              {(subscription.renewsAtPrice / 100).toFixed(2)}
                            </b>
                          </div>
                        )}
                      </div>
                      <div
                        {...css({
                          display: 'flex',
                          gap: '1rem',
                          alignItems: 'center',
                        })}
                      >
                        <MagazineSubscriptionActions
                          subscription={subscription}
                          refetchSubscriptions={refetchSubscriptions}
                        />

                        <a
                          {...css({ ...linkRule })}
                          href={`${STRIPE_DOMAIN}/${
                            subscription.company === 'REPUBLIK'
                              ? REPUBLIK_STRIPE_ID
                              : PROJECT_R_STRIPE_ID
                          }/subscriptions/${subscription.stripeId}`}
                          target='_blank'
                        >
                          Stripe <IconLink />
                        </a>
                      </div>
                    </summary>

                    <pre>{JSON.stringify(subscription, null, 2)}</pre>
                  </details>
                </li>
              )
            })}
          </ul>
        )
      }}
    />
  )
}

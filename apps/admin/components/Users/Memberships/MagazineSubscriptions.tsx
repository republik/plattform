import { useQuery } from '@apollo/client'
import { Loader } from '@project-r/styleguide'
import { UserMagazineSubscriptionsDocument } from '#graphql/republik-api/__generated__/gql/graphql'
import SubscriptionStatusBadge from './SubscriptionStatusBadge'
import { css } from 'glamor'
import Link from 'next/link'
import { IconLink } from '@republik/icons'
import { swissTime } from 'lib/utils/formats'

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
  const { data, loading, error } = useQuery(UserMagazineSubscriptionsDocument, {
    variables: {
      userId: props.userId,
    },
  })

  if (loading || (!error && data.user.magazineSubscriptions.length === 0)) {
    return null
  }

  return (
    <Loader
      loading={!data || loading}
      render={() => {
        return (
          <ul
            {...css({
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            })}
          >
            {data?.user?.magazineSubscriptions.map((subscription) => {
              return (
                <li
                  key={subscription.stripeId}
                  {...css({
                    border: '1px solid #eaeaea',
                    padding: '1rem',
                  })}
                >
                  <details>
                    <summary
                      {...css({
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      })}
                    >
                      <div
                        {...css({
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                        })}
                      >
                        <span>{subscription.type}</span>
                        <span>
                          Erstellt am {displayDateTime(subscription.createdAt)},
                        </span>
                      </div>

                      <SubscriptionStatusBadge status={subscription.status} />
                    </summary>
                    <div
                      {...css({
                        display: 'flex',
                        marginBottom: '1rem',
                      })}
                    >
                      <Link
                        href={`${STRIPE_DOMAIN}/subscriptions/${
                          subscription.stripeId
                        }?merchant_id=${
                          subscription.company === 'REPUBLIK'
                            ? REPUBLIK_STRIPE_ID
                            : PROJECT_R_STRIPE_ID
                        }`}
                        target='_blank'
                      >
                        Stripe Subscription <IconLink />
                      </Link>
                    </div>

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

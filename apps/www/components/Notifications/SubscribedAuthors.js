import { useMemo } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { myUserSubscriptions } from './enhancers'
import {
  Editorial,
  Interaction,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import SubscribeCheckbox from './SubscribeCheckbox'
import withT from '../../lib/withT'
import Loader from '../Loader'
import Link from 'next/link'

const styles = {
  checkboxes: css({
    margin: '20px 0',
  }),
  authorContainer: css({
    display: 'flex',
    flexDirection: 'column',
    paddingTop: 8,
    ':first-of-type': {
      paddingTop: 0,
    },
    paddingBottom: 5,
    [mediaQueries.mUp]: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  }),
  author: css({
    display: 'flex',
    flexDirection: 'row',
    marginBottom: 10,
    [mediaQueries.mUp]: {
      marginBottom: 0,
    },
  }),
  checkbox: css({
    display: 'flex',
    flexDirection: 'row',
    ' div': {
      marginRight: 16,
    },
  }),
}

const SubscribedAuthors = ({
  t,
  data: { myUserSubscriptions, loading, error },
}) => {
  const [colorScheme] = useColorContext()

  const authorContainerRule = useMemo(
    () =>
      css({
        [mediaQueries.mUp]: {
          '&:nth-child(even)': {
            backgroundColor: colorScheme.getCSSColor('hover'),
          },
        },
      }),
    [colorScheme],
  )

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const subscribedUsers = myUserSubscriptions.subscribedTo.nodes

        const totalSubs =
          subscribedUsers &&
          subscribedUsers.filter((user) => user.active).length

        return (
          <>
            <Interaction.P style={{ marginBottom: 10 }}>
              {t.pluralize('Notifications/settings/authors/summary', {
                count: totalSubs,
              })}
            </Interaction.P>
            <div style={{ margin: '20px 0' }}>
              {(subscribedUsers).map((user) => (
                <div
                  {...styles.authorContainer}
                  {...authorContainerRule}
                  key={user.object.id}
                >
                  <div {...styles.author}>
                    <Link
                      href={`/~${user.userDetails.slug}`}
                      passHref
                      legacyBehavior
                    >
                      <Editorial.A>{user.object.name}</Editorial.A>
                    </Link>
                  </div>
                  <div {...styles.checkbox}>
                    {(user.userDetails.documents.totalCount ||
                    (user.active && user.filters.includes('Document'))
                      ? ['Document', 'Comment']
                      : ['Comment']
                    ).map((filter) => (
                      <SubscribeCheckbox
                        key={`${user.object.id}-${filter}`}
                        subscription={user}
                        filterName={filter}
                        filterLabel
                        callout
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      }}
    />
  )
}

export default compose(withT, graphql(myUserSubscriptions))(SubscribedAuthors)

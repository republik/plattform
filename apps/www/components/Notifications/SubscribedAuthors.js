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
import Image from 'next/image'

const styles = {
  checkboxes: css({
    margin: '20px 0',
  }),
  authors: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  }),
  authorContainer: css({
    display: 'grid',
    gap: 16,
    gridTemplateColumns: '42px 1fr',
    gridTemplateAreas: `"portrait name"
      "portrait actions"`,
    alignItems: 'center',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '42px 1fr max-content',
      gridTemplateAreas: '"portrait name actions"',
    },
  }),
  author: css({
    gridArea: 'name',
  }),
  authorPortrait: css({
    gridArea: 'portrait',
    backgroundColor: 'var(--color-hover)',
    display: 'block',
    borderRadius: 42,
    width: 42,
    height: 42,
    objectFit: 'cover',
  }),
  checkbox: css({
    gridArea: 'actions',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
        const allSubscribedUsers = myUserSubscriptions.subscribedTo.nodes

        const subscribedAuthors = allSubscribedUsers
          .filter((user) => user.userDetails.documents.totalCount > 0)
          .sort((a, b) => a.object.name.localeCompare(b.object.name))

        const subscribedUsers = allSubscribedUsers
          .filter((user) => user.userDetails.documents.totalCount === 0)
          .sort((a, b) => a.object.name.localeCompare(b.object.name))

        const susbcribedAuthorsAndUsersSorted =
          subscribedAuthors.concat(subscribedUsers)

        const totalSubs =
          allSubscribedUsers &&
          allSubscribedUsers.filter((user) => user.active).length

        return (
          <>
            <Interaction.P style={{ marginBottom: 10 }}>
              {t.pluralize('Notifications/settings/authors/summary', {
                count: totalSubs,
              })}
            </Interaction.P>
            <div style={{ margin: '20px 0' }}>
              {susbcribedAuthorsAndUsersSorted.map((user) => {
                const portraitUrl = user.userDetails.portrait
                  ? new URL(user.userDetails.portrait)
                  : null
                portraitUrl?.searchParams.set('resize', '84x84')

                return (
                  <div
                    {...styles.authorContainer}
                    {...authorContainerRule}
                    key={user.object.id}
                  >
                    {portraitUrl ? (
                      <Image
                        className={styles.authorPortrait}
                        src={portraitUrl.toString()}
                        width={84}
                        height={84}
                        unoptimized
                        alt=''
                      />
                    ) : (
                      <div className={styles.authorPortrait}></div>
                    )}
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
                )
              })}
            </div>
          </>
        )
      }}
    />
  )
}

export default compose(withT, graphql(myUserSubscriptions))(SubscribedAuthors)

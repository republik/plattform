import { graphql } from '@apollo/client/react/hoc'
import { Interaction, mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Image from 'next/image'
import Link from 'next/link'
import withT from '../../lib/withT'
import Loader from '../Loader'
import { myUserSubscriptions } from './enhancers'
import SubscribeCheckbox from './SubscribeCheckbox'

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
    columnGap: 16,
    gridTemplateColumns: '64px 1fr',
    gridTemplateAreas: `"portrait name"
      "portrait actions"`,
    placeItems: 'center start',
    [mediaQueries.mUp]: {
      gridTemplateColumns: '64px 1fr max-content',
      gridTemplateAreas: '"portrait name actions"',
    },
  }),
  authorName: css({
    gridArea: 'name',
    display: 'block',
    fontWeight: '700',
    textDecoration: 'none',
  }),
  authorPortrait: css({
    gridArea: 'portrait',
    backgroundColor: 'var(--color-hover)',
    display: 'block',
    borderRadius: 64,
    width: 64,
    height: 64,
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
            <div {...styles.authors}>
              {susbcribedAuthorsAndUsersSorted.map((user) => {
                const portraitUrl = user.userDetails.portrait
                  ? new URL(user.userDetails.portrait)
                  : null
                portraitUrl?.searchParams.set('resize', '128x128')

                return (
                  <div {...styles.authorContainer} key={user.object.id}>
                    {portraitUrl ? (
                      <Image
                        className={styles.authorPortrait}
                        src={portraitUrl.toString()}
                        width={128}
                        height={128}
                        unoptimized
                        alt=''
                      />
                    ) : (
                      <div className={styles.authorPortrait}></div>
                    )}
                    <Link
                      {...styles.authorName}
                      href={`/~${user.userDetails.slug}`}
                    >
                      {user.object.name}
                    </Link>
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

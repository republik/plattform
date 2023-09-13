import { useMemo, useState } from 'react'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { myUserSubscriptions } from './enhancers'
import {
  Editorial,
  plainButtonRule,
  A,
  Interaction,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import { css } from 'glamor'
import { descending } from 'd3-array'
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
  data: { authors, myUserSubscriptions, loading, error },
}) => {
  const [colorScheme] = useColorContext()
  const [showAll, setShowAll] = useState(false)
  const [initiallySubscribedAuthorIds, setInitiallySubscribedAuthorIds] =
    useState([])

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

  const initializeSubscribedAuthorIds = (
    authors,
    myUserSubscriptions,
    setInitialySubscribedAuthorIds,
  ) => {
    if (!authors || !myUserSubscriptions) {
      return
    }

    const subscribedOtherAuthors = myUserSubscriptions.subscribedTo.nodes
    const subscribedPromotedAuthors = authors.map(
      (author) => author.user.subscribedByMe,
    )

    const allSusbcribedAuthors = subscribedPromotedAuthors
      .concat(subscribedOtherAuthors)
      .filter((author) => author.active)
      .map((author) => author.object.id)

    setInitialySubscribedAuthorIds(allSusbcribedAuthors)
  }

  return (
    <Loader
      loading={loading}
      error={error}
      render={() => {
        const subscribedPromotedAuthors = authors.map(
          (author) => author.user.subscribedByMe,
        )
        const subscribedOtherAuthors = myUserSubscriptions.subscribedTo.nodes
        const allSusbcribedAuthors = subscribedPromotedAuthors.concat(
          subscribedOtherAuthors,
        )
        const filteredAuthors = allSusbcribedAuthors
          .filter(
            (author, index, all) =>
              all.findIndex((e) => e.id === author.id) === index,
          )
          .sort((a, b) =>
            descending(
              +initiallySubscribedAuthorIds.includes(a.object.id),
              +initiallySubscribedAuthorIds.includes(b.object.id),
            ),
          )

        const visibleAuthors =
          filteredAuthors && filteredAuthors.filter((author) => author.active)

        const totalSubs =
          filteredAuthors &&
          filteredAuthors.filter((author) => author.active).length

        return (
          <>
            <Interaction.P style={{ marginBottom: 10 }}>
              {t.pluralize('Notifications/settings/authors/summary', {
                count: totalSubs,
              })}
            </Interaction.P>
            <div style={{ margin: '20px 0' }}>
              {(showAll ? filteredAuthors : visibleAuthors).map((author) => (
                <div
                  {...styles.authorContainer}
                  {...authorContainerRule}
                  key={author.object.id}
                >
                  <div {...styles.author}>
                    <Link
                      href={`/~${author.userDetails.slug}`}
                      passHref
                      legacyBehavior
                    >
                      <Editorial.A>{author.object.name}</Editorial.A>
                    </Link>
                  </div>
                  <div {...styles.checkbox}>
                    {(author.userDetails.documents.totalCount ||
                    (author.active && author.filters.includes('Document'))
                      ? ['Document', 'Comment']
                      : ['Comment']
                    ).map((filter) => (
                      <SubscribeCheckbox
                        key={`${author.object.id}-${filter}`}
                        subscription={author}
                        filterName={filter}
                        filterLabel
                        callout
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {filteredAuthors.length !== visibleAuthors.length && (
              <button
                {...plainButtonRule}
                onClick={() => {
                  initializeSubscribedAuthorIds(
                    authors,
                    myUserSubscriptions,
                    setInitiallySubscribedAuthorIds,
                  )
                  setShowAll(!showAll)
                }}
              >
                <A>
                  {t(
                    `Notifications/settings/formats/${
                      showAll ? 'hide' : 'show'
                    }`,
                  )}
                </A>
              </button>
            )}
          </>
        )
      }}
    />
  )
}

export default compose(withT, graphql(myUserSubscriptions))(SubscribedAuthors)

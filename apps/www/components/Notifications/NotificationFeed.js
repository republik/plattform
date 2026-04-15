import {
  A,
  Center,
  fontStyles,
  Interaction,
  Label,
  mediaQueries,
  plainButtonRule,
  RawHtml,
  useColorContext,
} from '@project-r/styleguide'
import { nest } from 'd3-collection'
import { css } from 'glamor'
import compose from 'lodash/flowRight'
import Link from 'next/link'
import { useMemo } from 'react'
import { timeFormat } from '../../lib/utils/format'
import withT from '../../lib/withT'
import DateLabel from '../Feed/DateLabel'
import InfiniteScroll from '../Frame/InfiniteScroll'
import CommentNotification from './CommentNotification'
import DocumentNotification from './DocumentNotification'
import { withMarkAllAsReadMutation } from './enhancers'

const dateFormat = timeFormat('%A,\n%d.%m.%Y')

const groupByDate = nest().key((n) => {
  return dateFormat(new Date(n.createdAt))
})

const styles = {
  container: css({
    paddingTop: 15,
    paddingBottom: 120,
    [mediaQueries.mUp]: {
      paddingTop: 40,
    },
  }),
  more: css({
    position: 'relative',
    height: 50,
    padding: '20px 0 0 0',
  }),
  reloadBannerButton: css({
    cursor: 'pointer',
    textDecoration: 'underline',
  }),
  unpublished: css({
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    margin: 0,
    paddingTop: 10,
    paddingBottom: 40,
  }),
  unpublishedTitle: css({
    ...fontStyles.sansSerifMedium14,
    [mediaQueries.mUp]: fontStyles.sansSerifMedium16,
    margin: '5px 0 3px',
  }),
  unpublishedBody: css({
    ...fontStyles.serifRegular14,
    [mediaQueries.mUp]: fontStyles.serifRegular16,
    margin: 0,
  }),
  cleanLink: css({
    color: 'inherit',
    textDecoration: 'none',
  }),
}

const ReloadBanner = withT(({ t, futureNotifications, onReload }) => {
  const [colorScheme] = useColorContext()
  return (
    <>
      {futureNotifications ? (
        <div {...colorScheme.set('backgroundColor', 'alert')}>
          <Center>
            <Interaction.P>
              {t.pluralize('Notifications/refresh', {
                count: futureNotifications,
              })}{' '}
              <span {...styles.reloadBannerButton} onClick={() => onReload()}>
                {t('Notifications/refresh/link')}
              </span>
            </Interaction.P>
          </Center>
        </div>
      ) : null}
    </>
  )
})

export default compose(
  withT,
  withMarkAllAsReadMutation,
)(
  ({
    t,
    notifications,
    me,
    loadedAt,
    fetchMore,
    futureNotifications,
    onReload,
    markAllAsReadMutation,
  }) => {
    const { nodes, totalCount, unreadCount, pageInfo } = notifications
    const hasNextPage = pageInfo && pageInfo.hasNextPage
    const [colorScheme] = useColorContext()

    const linkStyleRule = useMemo(
      () =>
        css({
          textDecoration: 'none',
          color: colorScheme.getCSSColor('primary'),
          '@media (hover)': {
            ':hover': {
              color: colorScheme.getCSSColor('primaryHover'),
            },
          },
        }),
      [colorScheme],
    )

    const loadMore = () =>
      fetchMore({
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const geNodes = (data) => data.notifications.nodes
          const prevNodes = geNodes(previousResult)
          const moreNodes = geNodes(fetchMoreResult)
          const mergedNodes = prevNodes
            .concat(moreNodes)
            .filter(
              (node, index, all) =>
                all.findIndex((n) => n.id === node.id) === index,
            )
          return {
            ...fetchMoreResult,
            notifications: {
              ...fetchMoreResult.notifications,
              nodes: mergedNodes,
            },
          }
        },
        variables: {
          after: pageInfo && pageInfo.endCursor,
        },
      })

    const isNew = (node) => !node.readAt || loadedAt < new Date(node.readAt)

    if (!nodes) return null
    const isEmpty = !nodes.length

    return (
      <>
        <ReloadBanner
          futureNotifications={futureNotifications}
          onReload={onReload}
        />
        <Center {...styles.container}>
          <div style={{ marginBottom: 40 }}>
            <Interaction.H1 style={{ marginBottom: 20 }}>
              {isEmpty
                ? t('Notifications/empty/title')
                : t.pluralize('Notifications/title', {
                    count: unreadCount,
                  })}
            </Interaction.H1>

            <Link href='/konto/benachrichtigungen' passHref legacyBehavior>
              <A>{t('Notifications/settings')}</A>
            </Link>

            {!isEmpty && (
              <button
                {...linkStyleRule}
                {...plainButtonRule}
                style={{ marginLeft: 15 }}
                onClick={() => markAllAsReadMutation().then(onReload)}
              >
                {t('Notifications/markAsRead')}
              </button>
            )}

            {isEmpty && (
              <Interaction.P style={{ marginTop: 40 }}>
                <RawHtml
                  dangerouslySetInnerHTML={{
                    __html: t('Notifications/empty/paragraph'),
                  }}
                />
              </Interaction.P>
            )}
          </div>

          <InfiniteScroll
            hasMore={hasNextPage}
            loadMore={loadMore}
            totalCount={totalCount}
            currentCount={nodes.length}
            loadMoreStyles={styles.more}
          >
            {groupByDate.entries(nodes).map(({ key, values }, i, all) => {
              return (
                <DateLabel key={i} label={key}>
                  {values.map((node, j) => {
                    if (
                      !node.object ||
                      (node.object.__typename === 'Comment' &&
                        !node.object.published)
                    ) {
                      return (
                        <div
                          {...styles.unpublished}
                          {...colorScheme.set('borderColor', 'text')}
                          {...colorScheme.set(
                            'backgroundColor',
                            isNew(node) ? 'alert' : 'none',
                          )}
                          key={j}
                        >
                          {node.content && (
                            <>
                              <a {...styles.cleanLink} href={node.content.url}>
                                <h3 {...styles.unpublishedTitle}>
                                  {node.content.title}
                                </h3>
                                <Label>
                                  {t('Notifications/unpublished/label')}
                                </Label>
                              </a>
                            </>
                          )}
                          {!node.content && (
                            <Label>
                              {t('Notifications/unpublished/label')}
                            </Label>
                          )}
                        </div>
                      )
                    }
                    return node.object.__typename === 'Document' ? (
                      <DocumentNotification
                        isNew={isNew(node)}
                        node={node}
                        key={j}
                      />
                    ) : (
                      <CommentNotification
                        isNew={isNew(node)}
                        node={node}
                        key={j}
                      />
                    )
                  })}
                </DateLabel>
              )
            })}
          </InfiniteScroll>
        </Center>
      </>
    )
  },
)

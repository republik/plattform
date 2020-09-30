import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { serifBold17, serifBold19 } from '../Typography/styles'
import { TeaserSectionTitle } from '../TeaserShared'
import { TeaserFeed } from '../TeaserFeed'
import colors from '../../theme/colors'
import ColorContext from '../Colors/ColorContext'
import { useColorContext } from '../Colors/useColorContext'

const DefaultLink = ({ children }) => children

const NBSP = '\u00a0'
const limitedTitle = (title, limit = 130) =>
  `${title.substring(0, limit).trim()}${
    title.length >= limit ? `${NBSP}…` : ''
  }`

const TeaserMyMagazine = ({
  latestSubscribedArticles,
  latestProgressOrBookmarkedArticles,
  ActionBar,
  bookmarksUrl,
  bookmarkLabel,
  notificationsUrl,
  notificationsLabel,
  Link = DefaultLink,
  placeholder = null
}) => {
  const [colorScheme] = useColorContext()

  if (
    !latestSubscribedArticles?.length &&
    !latestProgressOrBookmarkedArticles?.length
  ) {
    return placeholder
  }

  return (
    <div
      style={{
        backgroundColor: colorScheme.primaryBg,
        // for color inherit below, e.g. TeaserSectionTitle
        color: colorScheme.text
      }}
    >
      <section {...css(styles.section)}>
        <div role='group' {...css(styles.row, styles.withHighlight)}>
          {latestProgressOrBookmarkedArticles?.length ? (
            <div
              {...(latestSubscribedArticles?.length
                ? styles.left
                : styles.center)}
            >
              <div {...styles.sectionTitle}>
                <Link href={bookmarksUrl} passHref>
                  <TeaserSectionTitle small href={bookmarksUrl}>
                    {bookmarkLabel}
                  </TeaserSectionTitle>
                </Link>
              </div>
              {latestProgressOrBookmarkedArticles.map(doc => {
                const { id } = doc
                const { path, shortTitle, title } = doc.meta

                return (
                  <div
                    {...styles.tile}
                    style={{ border: `1px solid ${colorScheme.text}` }}
                    key={id}
                  >
                    <Link href={path} passHref>
                      <a
                        {...styles.tileHeadline}
                        style={{ color: colorScheme.text }}
                      >
                        {limitedTitle(shortTitle || title, 130)}
                      </a>
                    </Link>
                    {ActionBar ? (
                      <div style={{ marginTop: 10 }}>
                        <ActionBar mode='bookmark' document={doc} />
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
          {latestSubscribedArticles?.length ? (
            <div
              {...(latestProgressOrBookmarkedArticles?.length
                ? styles.right
                : styles.center)}
            >
              <div {...styles.sectionTitle}>
                <Link href={notificationsUrl} passHref>
                  <TeaserSectionTitle small href={notificationsUrl}>
                    {notificationsLabel}
                  </TeaserSectionTitle>
                </Link>
              </div>
              {latestSubscribedArticles.map(doc => {
                const { format, path, shortTitle, title, credits } = doc.meta

                return (
                  <TeaserFeed
                    Link={Link}
                    color={colorScheme.text}
                    format={format}
                    path={path}
                    title={limitedTitle(shortTitle || title, 140)}
                    credits={credits}
                  />
                )
              })}
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}

const styles = {
  section: css({
    margin: '0 auto',
    maxWidth: 1300,
    padding: '40px 15px 10px',
    [mUp]: {
      padding: '50px 15px 40px'
    }
  }),
  sectionTitle: css({
    marginBottom: 24,
    [mUp]: {
      marginBottom: 36
    }
  }),
  row: css({
    display: 'flex',
    flexDirection: 'column',
    [mUp]: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }
  }),
  left: css({
    marginBottom: 32,
    [mUp]: {
      flex: 1,
      marginRight: 16,
      marginBottom: 0
    }
  }),
  right: css({
    [mUp]: {
      flex: 1,
      marginLeft: 16
    }
  }),
  center: css({
    marginBottom: 0,
    [mUp]: {
      width: '50%',
      marginBottom: 0
    }
  }),
  tile: css({
    padding: '16px 8px 12px 8px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    ':last-child': {
      marginBottom: 30,
      [mUp]: {
        marginBottom: 40
      }
    },
    [mUp]: {
      padding: '12px 8px'
    }
  }),
  tileHeadline: css({
    textDecoration: 'none',
    cursor: 'pointer',
    wordWrap: 'break-word',
    width: '100%',
    ...serifBold17,
    lineHeight: '18px',
    [mUp]: {
      ...serifBold19,
      lineHeight: '21px'
    }
  })
}

TeaserMyMagazine.propTypes = {
  latestSubscribedArticles: PropTypes.array,
  latestProgressOrBookmarkedArticles: PropTypes.array
}

const WrappedTeaserMyMagazine = props => (
  <ColorContext.Provider value={colors.negative}>
    <TeaserMyMagazine {...props} />
  </ColorContext.Provider>
)

export default WrappedTeaserMyMagazine

WrappedTeaserMyMagazine.data = {
  config: {
    options: ({ first = 2 }) => ({
      variables: {
        first: +first
      },
      ssr: false
    }),
    props: ({ data }) => {
      return {
        data: {
          loading: data.loading,
          error: data.error,
          latestSubscribedArticles: data.notifications?.nodes
            .map(i => i.object)
            .filter(Boolean),
          latestProgressOrBookmarkedArticles: data.me?.bookmarkAndProgress.nodes
            .map(i => i.document)
            .filter(Boolean)
        }
      }
    }
  },
  query: `
    query getMyMagazineDocuments {
      notifications(first: 2, filter: Document) {
        nodes {
          id
          object {
            ... on Document {
              id
              meta {
                shortTitle
                title
                credits
                path
                format {
                  id
                  meta {
                    title
                    kind
                    template
                    path
                  }
                }
              }
            }
          }
        }
      }
      me {
        id
        bookmarkAndProgress: collectionItems(names: ["progress", "bookmarks"], first: 2, progress: UNFINISHED, uniqueDocuments: true, lastDays: 30) {
          nodes {
            id
            document {
              id
              meta {
                publishDate
                shortTitle
                title
                path
                credits
                estimatedConsumptionMinutes
                estimatedReadingMinutes
              }
              userProgress {
                id
                percentage
                nodeId
                updatedAt
                max {
                  id
                  percentage
                  updatedAt
                }
              }
              userBookmark: userCollectionItem(collectionName: "bookmarks") {
                id
                createdAt
              }
            }
          }
        }
      }
    }
  `
}

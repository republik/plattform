import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import * as Headlines from '../TeaserFeed/Headline'
import {
  serifTitle20,
  serifTitle22,
  sansSerifMedium14,
  sansSerifMedium16
} from '../Typography/styles'
import { TeaserSectionTitle } from '../TeaserShared'
import { TeaserFeed } from '../TeaserFeed'
import colors from '../../theme/colors'
import { useColorContext } from '../Colors/useColorContext'
import { convertStyleToRem } from '../Typography/utils'

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
        // for color inherit below, e.g. TeaserSectionTitle
        color: colorScheme.text
      }}
    >
      <section {...css(styles.section)}>
        <TeaserSectionTitle>Meine Republik</TeaserSectionTitle>
        <div role='group' {...css(styles.row, styles.withHighlight)}>
          {latestProgressOrBookmarkedArticles?.length ? (
            <div
              {...(latestSubscribedArticles?.length
                ? styles.left
                : styles.center)}
            >
              {latestProgressOrBookmarkedArticles.map(doc => {
                const { id } = doc
                const {
                  path,
                  title,
                  template,
                  kind: metaKind,
                  color: metaColor
                } = doc.meta
                const formatMeta = doc.meta.format?.meta
                const formatTitle = formatMeta?.title
                const formatPath = formatMeta?.path

                const formatColor = formatMeta?.title
                  ? colorScheme.set(
                      'color',
                      formatMeta.color || colors[formatMeta.kind],
                      'format'
                    )
                  : template === 'format'
                  ? colorScheme.set(
                      'color',
                      metaColor || colors[metaKind],
                      'format'
                    )
                  : colorScheme.set('color', 'text')

                const Headline =
                  formatMeta?.kind === 'meta' ||
                  metaKind === 'meta' ||
                  template === 'format'
                    ? Headlines.Interaction
                    : formatMeta?.kind === 'scribble' || metaKind === 'scribble'
                    ? Headlines.Scribble
                    : Headlines.Editorial
                return (
                  <div
                    {...styles.tile}
                    style={{ border: `1px solid ${colorScheme.divider}` }}
                    key={id}
                  >
                    {formatMeta ? (
                      <Link href={formatPath} passHref>
                        <a
                          {...styles.formatAnchor}
                          href={formatPath}
                          {...formatColor}
                        >
                          {formatTitle}
                        </a>
                      </Link>
                    ) : null}
                    <Headline>
                      <Link href={path} passHref>
                        <a
                          {...styles.tileHeadline}
                          style={{ color: colorScheme.text }}
                        >
                          {limitedTitle(title, 100)}
                        </a>
                      </Link>
                    </Headline>
                    {ActionBar ? (
                      <div style={{ marginTop: 10 }}>
                        <ActionBar mode='bookmark' document={doc} />
                      </div>
                    ) : null}
                  </div>
                )
              })}
              <Link href={bookmarksUrl} passHref>
                <TeaserSectionTitle small href={bookmarksUrl}>
                  {'Alle Beiträge zum Weiterlesen'}
                </TeaserSectionTitle>
              </Link>
            </div>
          ) : null}
          {latestSubscribedArticles?.length ? (
            <div
              {...(latestProgressOrBookmarkedArticles?.length
                ? styles.right
                : styles.center)}
            >
              {latestSubscribedArticles.map(doc => {
                const {
                  format,
                  path,
                  title,
                  credits,
                  publishDate,
                  emailSubject,
                  color
                } = doc.meta

                return (
                  <TeaserFeed
                    key={doc.id}
                    Link={Link}
                    color={color}
                    format={format}
                    path={path}
                    title={limitedTitle(emailSubject || title, 140)}
                    credits={credits}
                    publishDate={publishDate}
                  />
                )
              })}
              <Link href={notificationsUrl} passHref>
                <TeaserSectionTitle small href={notificationsUrl}>
                  {notificationsLabel}
                </TeaserSectionTitle>
              </Link>
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
    width: '100%'
  }),
  formatAnchor: css({
    color: 'inherit',
    textDecoration: 'none',
    marginBottom: 4,
    ...convertStyleToRem(sansSerifMedium14),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium16)
    }
  })
}

TeaserMyMagazine.propTypes = {
  latestSubscribedArticles: PropTypes.array,
  latestProgressOrBookmarkedArticles: PropTypes.array
}

const WrappedTeaserMyMagazine = props => <TeaserMyMagazine {...props} />

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
      notifications(first: 2, filter: Document, lastDays: 30) {
        nodes {
          id
          object {
            ... on Document {
              id
              meta {
                title
                emailSubject
                credits
                prepublication
                path
                kind
                template
                color
                publishDate
                format {
                  id
                  meta {
                    path
                    title
                    color
                    kind
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
                title
                path
                template
                kind
                color
                credits
                estimatedConsumptionMinutes
                estimatedReadingMinutes
                format {
                  id
                  meta {
                    path
                    title
                    color
                    kind
                  }
                }
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

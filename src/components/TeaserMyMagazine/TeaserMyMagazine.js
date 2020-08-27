import { css } from 'glamor'
import React from 'react'
import PropTypes from 'prop-types'
import { mUp } from '../../theme/mediaQueries'
import { serifBold17, serifBold19 } from '../Typography/styles'
import { TeaserFeed } from '../TeaserFeed'
import colors from '../../theme/colors'

const DefaultLink = ({ children }) => children

const TeaserMyMagazine = ({
  latestSubscribedArticles,
  latestProgressOrBookmarkedArticles,
  bar,
  Link = DefaultLink
}) => {
  return (
    <section {...styles.section}>
      <div role='group' {...css(styles.row, styles.withHighlight)}>
        <div {...styles.left}>
          {latestProgressOrBookmarkedArticles.map(document => {
            const { path, id } = document
            const { shortTitle } = document.meta
            return (
              <div
                {...styles.tile}
                style={{ border: `1px solid ${colors.negative.text}` }}
                key={id}
              >
                <Link href={path} passHref>
                  <a
                    {...styles.tileHeadline}
                    style={{ color: colors.negative.text }}
                  >
                    {shortTitle.substring(0, 150).trim()}
                    {shortTitle.length >= 150 && <>&nbsp;…</>}
                  </a>
                </Link>
                {bar && bar}
              </div>
            )
          })}
        </div>
        <div {...styles.right}>
          {latestSubscribedArticles.map(document => (
            <TeaserFeed
              Link={Link}
              color={colors.negative.text}
              format={document.meta.format}
              title={
                document.meta.shortTitle
                  ? `${document.meta.shortTitle.substring(0, 150).trim()} ${
                      document.meta.shortTitle.length >= 150 ? '…' : ''
                    }`
                  : document.meta.title
              }
              credits={document.meta.credits}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const styles = {
  section: css({
    margin: '0 auto',
    maxWidth: 1300,
    padding: '40px 15px 10px',
    backgroundColor: colors.negative.primaryBg,
    [mUp]: {
      padding: '50px 15px 40px'
    }
  }),
  row: css({
    display: 'flex',
    flexDirection: 'column',
    [mUp]: {
      flexDirection: 'row'
    }
  }),
  left: css({
    marginBottom: 32,
    [mUp]: {
      width: '50%',
      flexGrow: 1,
      marginRight: 16,
      marginBottom: 0
    }
  }),
  right: css({
    [mUp]: {
      width: '50%',
      display: 'flex',
      flexDirection: 'column',
      flexGrow: 1,
      marginLeft: 16
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
      marginBottom: 0
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

export default TeaserMyMagazine

TeaserMyMagazine.propTypes = {
  latestSubscribedArticles: PropTypes.array,
  latestProgressOrBookmarkedArticles: PropTypes.array
}

TeaserMyMagazine.data = {
  config: {
    options: ({ first = 2 }) => ({
      variables: {
        first: +first
      }
    }),
    props: ({ data }) => {
      const latestProgressOrBookmarkedArticles = data.me.progressCollection.items.nodes
        .concat(data.me.bookmarkCollection.items.nodes)
        .sort((a, b) => {
          return (
            new Date(a.document.meta.publishDate) -
            Date(b.document.meta.publishDate)
          )
        })
        .slice(1)
      return {
        data: {
          loading: data.loading,
          error: data.error,
          latestSubscribedArticles: data.documents.nodes,
          latestProgressOrBookmarkedArticles
        }
      }
    }
  },
  query: `
  query getMyMagazineDocuments {
    documents: search(
      filters: [
          { key: "template", not: true, value: "section" }
          { key: "template", not: true, value: "format" }
          { key: "template", not: true, value: "front" }
        ]
        filter: { feed: true }
        sort: { key: publishedAt, direction: DESC }
        first: 2
      ) {
        nodes {
          entity {
            ... on Document {
              meta {
                shortTitle
                title
                credits
              }
            }
          }
        }
      }
    me {
      progressCollection: collection(name: "progress") {
        items(first: 2) {
          nodes {
            document {
              id
              meta {
                publishDate
                shortTitle
                title
              }
            }
          }
        }
      }
      bookmarkCollection: collection(name: "bookmarks") {
        items(first: 2) {
          nodes {
            document {
              id
              meta {
                publishDate
                shortTitle
                title
                credits
              }
              userProgress {
                id
                percentage
              }
            }
          }
        }
      }  
    }
  }
  `
}

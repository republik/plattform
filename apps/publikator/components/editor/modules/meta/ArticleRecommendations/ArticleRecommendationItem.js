import React from 'react'
import { css } from 'glamor'
import {
  IconButton,
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
  A,
  fontStyles,
  InlineSpinner,
} from '@project-r/styleguide'
import withT from '../../../../../lib/withT'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import PublicIcon from 'react-icons/lib/md/public'
import { FRONTEND_BASE_URL } from '../../../../../lib/settings'

const styles = {
  recommendationItem: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
  }),
  arrowWrapper: css({
    display: 'inline-flex',
    flexDirection: 'column',
    '& > button': {
      marginRight: 0,
    },
  }),
  contentWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: '.5rem',
  }),
  title: css({
    ...fontStyles.sansSerifMedium18,
    marginRight: '.5rem',
  }),
  titleLine: css({
    display: 'inline-flex',
    alignItems: 'center',
  }),
}

const ArticleRecommendationItem = ({
  repoId: value,
  handleRemove,
  handleUp,
  handleDown,
  isFirst,
  isLast,
  data: { loading, errors, repoData, ...data },
  ...props
}) => {
  const metaData = repoData?.latestPublications[0]?.document?.meta
  const authors = metaData?.authors
    ?.map((a) => a.firstName + ' ' + a.lastName)
    .join(', ')
  const articleLink = ``

  console.debug(
    'ey',
    JSON.stringify(
      { repoData, metaData, loading, errors, data, props },
      null,
      2,
    ),
  )

  return (
    <li key={value} {...styles.recommendationItem}>
      <div {...styles.arrowWrapper}>
        <IconButton
          Icon={ArrowUpIcon}
          onClick={handleUp}
          disabled={isFirst || loading}
        />
        <IconButton
          Icon={ArrowDownIcon}
          onClick={handleDown}
          disabled={isLast || loading}
        />
      </div>
      <div {...styles.contentWrapper}>
        {loading && <InlineSpinner size={20} />}
        {metaData && (
          <>
            <div {...styles.titleLine}>
              <span {...styles.title}>{metaData.title}</span>
              <A
                href={`${
                  metaData?.format?.meta?.externalBaseUrl || FRONTEND_BASE_URL
                }${metaData.path}`}
                target='_blank'
              >
                <PublicIcon />
              </A>
            </div>
            <div {...styles.content2ndLine}>
              <span>
                Von: {authors}, veröffentlicht am:{' '}
                {new Date(Date.parse(metaData.publishDate)).toLocaleDateString(
                  'de-CH',
                )}
              </span>
            </div>
          </>
        )}
      </div>
      <IconButton Icon={CloseIcon} onClick={handleRemove} disabled={loading} />
    </li>
  )
}

export default compose(
  withT,
  graphql(
    gql`
      query getLastPublishedMetaForRepoId($id: ID!) {
        repoData: repo(id: $id) {
          id
          latestPublications {
            document {
              meta {
                path
                title
                publishDate
                authors {
                  firstName
                  lastName
                }
                format {
                  meta {
                    externalBaseUrl
                  }
                }
              }
            }
          }
        }
      }
    `,
    {
      options: ({ repoId }) => ({
        variables: {
          id: repoId.replace('https://github.com/', ''),
        },
      }),
    },
  ),
)(ArticleRecommendationItem)

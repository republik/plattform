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
  useColorContext,
} from '@project-r/styleguide'
import withT from '../../../../../lib/withT'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import PublicIcon from 'react-icons/lib/md/public'
import { FRONTEND_BASE_URL } from '../../../../../lib/settings'
import { createRelativeRepoUrl } from './RepoLinkUtility'
import { errorToString } from '../../../../../lib/utils/errors'

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
  metaLine: css({
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > *:not(:first-child)': {
      marginTop: '.25rem',
    },
  }),
  errorLine: css({
    marginTop: '.25rem',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > *': {
      ...fontStyles.sansSerifRegular14,
    },
  }),
}

const ArticleRecommendationItem = ({
  data: { loading, repoData, errors },
  t,
  handleRemove,
  handleUp,
  handleDown,
  isFirst,
  isLast,
  isDuplicate,
  isRedundant,
}) => {
  const [colorScheme] = useColorContext()
  const latestPublication = repoData?.latestPublications[0]
  const documentData =
    latestPublication?.document ?? repoData?.latestCommit?.document
  const metaData = documentData?.meta
  const authors = metaData?.authors
    ?.map((author) => author.firstName + ' ' + author.lastName)
    .join(', ')
  const isPublished = !!metaData?.publishDate
  const isScheduled = !!latestPublication?.scheduledAt

  return (
    <li {...styles.recommendationItem}>
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
              {isPublished && (
                <A
                  href={`${
                    metaData?.format?.meta?.externalBaseUrl || FRONTEND_BASE_URL
                  }${metaData.path}`}
                  target='_blank'
                >
                  <PublicIcon />
                </A>
              )}
            </div>
            <div {...styles.metaLine}>
              <span>
                {t('metaData/recommendations/author', {
                  authors,
                })}
              </span>
              <span>
                {(isPublished || isScheduled) &&
                  (latestPublication?.live
                    ? t('metaData/recommendations/publishedAt', {
                        date: new Date(
                          Date.parse(metaData.publishDate),
                        ).toLocaleDateString('de-CH'),
                      })
                    : t('metaData/recommendations/scheduledAt', {
                        date: new Date(
                          Date.parse(latestPublication.scheduledAt),
                        ).toLocaleDateString('de-CH'),
                      }))}
              </span>
            </div>
            <div {...styles.errorLine}>
              {(isDuplicate || isRedundant) && (
                <>
                  {isDuplicate && (
                    <span {...colorScheme.set('color', 'error')}>
                      {t('metaData/recommendations/duplicate')}
                    </span>
                  )}
                  {isRedundant && (
                    <span {...colorScheme.set('color', 'error')}>
                      {t('metaData/recommendations/redundant')}
                    </span>
                  )}
                </>
              )}
              {errors && (
                <span {...colorScheme.set('color', 'error')}>
                  {errorToString(errors)}
                </span>
              )}
              {!isPublished && !isScheduled && (
                <span {...colorScheme.set('color', 'error')}>
                  {t('metaData/recommendations/notPublished')}
                </span>
              )}
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
      query getRecommendationMeta($id: ID!) {
        repoData: repo(id: $id) {
          id
          latestPublications {
            live
            prepublication
            scheduledAt
            document {
              ...MetaForRepoId
            }
          }

          meta {
            publishDate
          }
          latestCommit {
            id
            document {
              ...MetaForRepoId
            }
          }
        }
      }

      fragment MetaForRepoId on Document {
        id
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
    `,
    {
      options: ({ repoId }) => ({
        variables: {
          id: createRelativeRepoUrl(repoId),
        },
      }),
    },
  ),
)(ArticleRecommendationItem)

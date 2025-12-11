import { css } from 'glamor'
import {
  IconButton,
  fontStyles,
  InlineSpinner,
  useColorContext,
  TeaserFeed,
} from '@project-r/styleguide'
import withT from '../../../../../lib/withT'
import compose from 'lodash/flowRight'
import { graphql } from '@apollo/client/react/hoc'
import { gql } from '@apollo/client'
import { getRelativeRepoUrl } from './util/RepoLinkUtility'
import PublicationLink from '../../../../Publication/PublicationLink'
import {
  IconClose,
  IconEdit,
  IconKeyboardArrowDown,
  IconKeyboardArrowUp,
} from '@republik/icons'

const styles = {
  recommendationItem: css({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexDirection: 'row',
  }),
  arrowWrapper: css({
    display: 'inline-flex',
    flexDirection: 'column',
    marginTop: '0.5rem',
    '& > button': {
      marginRight: 0,
    },
  }),
  closeWrapper: css({
    marginTop: '1rem',
  }),
  contentWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: '1rem 0.5rem',
  }),
  linkWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    '& > *:not(:first-child)': {
      marginLeft: '0.5rem',
    },
  }),
  errorLine: css({
    marginTop: '0.25rem',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    '& > *': {
      ...fontStyles.sansSerifRegular14,
    },
  }),
}

const ArticleRecommendationItem = ({
  repoId,
  data: { loading, repoData },
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

  const isPublishedForPublic =
    latestPublication &&
    latestPublication.live &&
    !latestPublication.prepublication

  const isInternallyPublished =
    latestPublication &&
    latestPublication.live &&
    latestPublication.prepublication

  const isScheduledForPublication =
    latestPublication &&
    !latestPublication.live &&
    !latestPublication.prepublication &&
    !!latestPublication.scheduledAt

  return (
    <li {...styles.recommendationItem}>
      <div {...styles.arrowWrapper}>
        <IconButton
          Icon={IconKeyboardArrowUp}
          onClick={handleUp}
          disabled={isFirst || loading}
        />
        <IconButton
          Icon={IconKeyboardArrowDown}
          onClick={handleDown}
          disabled={isLast || loading}
        />
      </div>
      <div {...styles.contentWrapper}>
        {loading && <InlineSpinner size={20} />}
        {metaData && (
          <>
            <TeaserFeed
              title={metaData?.title}
              description={metaData?.description}
              credits={metaData?.credits}
              format={metaData?.format}
              t={t}
              prepublication={isInternallyPublished}
              dense
              nonInteractive
            />
          </>
        )}
        <div {...styles.errorLine}>
          {isScheduledForPublication && (
            <span {...colorScheme.set('color', 'textSoft')}>
              {t('metaData/recommendations/releaseScheduledFor', {
                date: () => {
                  const date = new Date(
                    Date.parse(latestPublication?.scheduledAt),
                  )
                  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
                },
              })}
            </span>
          )}
          {!latestPublication && repoData && (
            <span {...colorScheme.set('color', 'error')}>
              {t('metaData/recommendations/notPublished')}
            </span>
          )}
          {isInternallyPublished && (
            <span {...colorScheme.set('color', 'error')}>
              {t('metaData/recommendations/internalPublication')}
            </span>
          )}
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
          {!loading && !repoData && (
            <span {...colorScheme.set('color', 'error')}>
              {t('metaData/recommendations/notFound', {
                repoId,
              })}
            </span>
          )}
        </div>
        {repoData && (
          <div {...styles.linkWrapper}>
            {(isPublishedForPublic || isInternallyPublished) && (
              <PublicationLink publication={latestPublication} />
            )}
            <IconButton
              href={`/repo/${getRelativeRepoUrl(repoId)}/tree`}
              target='_blank'
              Icon={IconEdit}
              fill='#E9A733'
            />
          </div>
        )}
      </div>
      <div {...styles.closeWrapper}>
        <IconButton
          Icon={IconClose}
          onClick={handleRemove}
          disabled={loading}
        />
      </div>
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
              ...MetaDataForRepoId
            }
          }

          meta {
            publishDate
          }
          latestCommit {
            id
            document {
              ...MetaDataForRepoId
            }
          }
        }
      }

      fragment MetaDataForRepoId on Document {
        id
        meta {
          path
          title
          description
          publishDate
          credits
          format {
            id
            meta {
              title
              color
            }
          }
        }
      }
    `,
    {
      options: ({ repoId }) => ({
        variables: {
          id: getRelativeRepoUrl(repoId),
        },
      }),
    },
  ),
)(ArticleRecommendationItem)

import { css } from 'glamor'
import {
  IconButton,
  ArrowUpIcon,
  ArrowDownIcon,
  CloseIcon,
  fontStyles,
  InlineSpinner,
  useColorContext,
  convertStyleToRem,
  mediaQueries,
  TeaserFeed,
} from '@project-r/styleguide'
import withT from '../../../../../lib/withT'
import { compose, graphql } from 'react-apollo'
import gql from 'graphql-tag'
import { getRelativeRepoUrl } from './util/RepoLinkUtility'
import PublicationLink from '../../../../Publication/PublicationLink'
import { FRONTEND_BASE_URL } from '../../../../../lib/settings'

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
  title: css({
    marginRight: '0.5rem',
    ...convertStyleToRem(fontStyles.serifTitle20),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifTitle22),
    },
  }),
  lead: css({
    ...convertStyleToRem(fontStyles.serifRegular17),
    margin: '0 0 5px 0',
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.serifRegular19),
    },
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
      marginTop: '0.25rem',
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
            <TeaserFeed
              path={metaData.path}
              title={metaData?.shortTitle ?? metaData?.title}
              description={!metaData?.shortTitle ? metaData?.description : null}
              credits={metaData?.credits}
              format={metaData?.format}
              t={t}
              prepublication={isInternallyPublished}
              dense
              externalBaseUrl={FRONTEND_BASE_URL}
            />
          </>
        )}
        <div {...styles.errorLine}>
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
        {(isPublishedForPublic || isInternallyPublished) && (
          <div>
            <PublicationLink publication={latestPublication} />
          </div>
        )}
      </div>
      <div {...styles.closeWrapper}>
        <IconButton
          Icon={CloseIcon}
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
          shortTitle
          description
          publishDate
          credits
          authors {
            firstName
            lastName
          }
          format {
            meta {
              title
              color
              externalBaseUrl
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

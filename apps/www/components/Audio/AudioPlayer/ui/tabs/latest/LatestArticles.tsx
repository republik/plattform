import { useMemo, useState } from 'react'
import { css } from 'glamor'
import NoAccess from '../shared/NoAccess'
import { useLatestArticlesQuery } from '../../../../graphql/LatestArticlesHook'
import { useTranslation } from '../../../../../../lib/withT'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import LoadingPlaceholder from '../shared/LoadingPlaceholder'
import FilterButton from './FilterButton'
import { useMe } from '../../../../../../lib/context/MeContext'
import LatestArticleItem from './LatestArticleItem'

const styles = {
  root: css({
    paddingTop: 12,
  }),
  filters: css({
    display: 'flex',
    gap: 16,
  }),
  list: css({
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
    marginTop: 12,
    marginBottom: 24,
  }),
}

type LatestArticlesProps = {
  handleOpenArticle: (path: string) => Promise<void>
  handleDownload: (item: AudioQueueItem['document']) => Promise<void>
}

const LatestArticlesTab = ({
  handleOpenArticle,
  handleDownload,
}: LatestArticlesProps) => {
  const [filter, setFilter] = useState<'all' | 'read-aloud'>('read-aloud')
  const { t } = useTranslation()
  const { hasAccess } = useMe()
  const { data, loading, error, fetchMore } = useLatestArticlesQuery({
    variables: {
      count: 20,
    },
  })

  // Define if the real-aloud filter should be shown
  const hasReadAloudDocuments =
    data?.latestArticles?.nodes.some(
      (node) => node?.meta?.audioSource?.kind === 'readAloud',
    ) || false

  // Unset 'read-aloud' filter to if no documents are available
  if (!loading && !hasReadAloudDocuments && filter === 'read-aloud') {
    setFilter('all')
  }

  const filteredArticles = useMemo(() => {
    const articleWithAudio = data?.latestArticles?.nodes.filter(
      (article) => !!article?.meta?.audioSource,
    )

    return articleWithAudio?.filter((article) => {
      return (
        filter === 'all' || article?.meta?.audioSource?.kind === 'readAloud'
      )
    })
  }, [data, filter])

  if (!hasAccess) {
    return (
      <NoAccess
        text={t('AudioPlayer/Latest/NoAcces')}
        heading={t('AudioPlayer/shared/NoAccess/heading')}
      />
    )
  }

  if (loading) {
    return <LoadingPlaceholder />
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div {...styles.root}>
      <div {...styles.filters}>
        {hasReadAloudDocuments && (
          <FilterButton
            isActive={filter === 'read-aloud'}
            onClick={() => setFilter('read-aloud')}
          >
            {t('AudioPlayer/Latest/ReadAloud')}
          </FilterButton>
        )}

        <FilterButton
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          {t('AudioPlayer/Latest/All')}
        </FilterButton>
      </div>
      {filteredArticles?.length > 0 ? (
        <>
          <ul {...styles.list}>
            {filteredArticles.map((article) => (
              <li key={article.id}>
                <LatestArticleItem
                  article={article}
                  handleOpenArticle={handleOpenArticle}
                  handleDownload={handleDownload}
                />
              </li>
            ))}
          </ul>

          {data?.latestArticles.pageInfo.hasNextPage && (
            <button
              onClick={() => {
                console.log(
                  'fetchMore',
                  data?.latestArticles.pageInfo.endCursor,
                )
                fetchMore({
                  variables: {
                    after: data?.latestArticles.pageInfo.endCursor,
                  },
                  updateQuery(previous, { fetchMoreResult }) {
                    const previousNodes = previous?.latestArticles.nodes ?? []
                    const incomingNodes =
                      fetchMoreResult?.latestArticles.nodes ?? []
                    return {
                      latestArticles: {
                        ...fetchMoreResult.latestArticles,
                        nodes: [...previousNodes, ...incomingNodes],
                      },
                    }
                  },
                })
              }}
            >
              Fetch more
            </button>
          )}
        </>
      ) : (
        <p style={{ marginTop: 32 }}>{t('AudioPlayer/Latest/NoItems')}</p>
      )}
    </div>
  )
}

export default LatestArticlesTab

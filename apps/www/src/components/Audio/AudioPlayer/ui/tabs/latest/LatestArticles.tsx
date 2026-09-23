import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { useTranslation } from '@/lib/withT'
import { A, Spinner } from '@project-r/styleguide'
import { css } from 'glamor'
import { useMemo, useState } from 'react'
import { useLatestAudioArticles } from '../../../../hooks/useLatestAudioArticles'
import LoadingPlaceholder from '../shared/LoadingPlaceholder'
import FilterButton from './FilterButton'
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
  handleDownload: (item: AudioQueueItemContent) => Promise<void>
}

const LatestArticlesTab = ({
  handleOpenArticle,
  handleDownload,
}: LatestArticlesProps) => {
  const [filter, setFilter] = useState<'all' | 'read-aloud'>('read-aloud')
  const { t } = useTranslation()
  const { articles, isLoading, isLoadingMore, hasError, hasMore, loadMore } =
    useLatestAudioArticles()

  // "Read aloud" means read by a person — the counterpart to a synthetic voice.
  const hasReadAloudDocuments = articles.some(
    (article) => !article.syntheticVoiceEnabled,
  )

  // Unset 'read-aloud' filter to if no documents are available
  if (!isLoading && !hasReadAloudDocuments && filter === 'read-aloud') {
    setFilter('all')
  }

  const filteredArticles = useMemo(
    () =>
      articles.filter(
        (article) => filter === 'all' || !article.syntheticVoiceEnabled,
      ),
    [articles, filter],
  )

  if (isLoading) {
    return <LoadingPlaceholder />
  }

  if (hasError) {
    return <div>{t('AudioPlayer/Latest/NoItems')}</div>
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
      {filteredArticles.length > 0 ? (
        <>
          <ul {...styles.list}>
            {filteredArticles.map((article) => (
              <li key={article._id}>
                <LatestArticleItem
                  article={article}
                  handleOpenArticle={handleOpenArticle}
                  handleDownload={handleDownload}
                />
              </li>
            ))}
          </ul>

          {hasMore && (
            <p style={{ paddingBottom: '2rem' }}>
              {isLoadingMore ? (
                <Spinner size={16} />
              ) : (
                <A
                  href='#'
                  onClick={(e) => {
                    e?.preventDefault()
                    loadMore()
                  }}
                >
                  {t('AudioPlayer/Latest/LoadMore')}
                </A>
              )}
            </p>
          )}
        </>
      ) : (
        <p style={{ marginTop: 32 }}>{t('AudioPlayer/Latest/NoItems')}</p>
      )}
    </div>
  )
}

export default LatestArticlesTab

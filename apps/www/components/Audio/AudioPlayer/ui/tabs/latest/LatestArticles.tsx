import { useMemo, useState } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  PlaylistAddIcon,
  DownloadIcon,
  LinkIcon,
} from '@project-r/styleguide'
import AudioListItem from '../shared/AudioListItem'
import NoAccess from '../shared/NoAccess'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import { useLatestArticlesQuery } from '../../../../graphql/LatestArticlesHook'
import { useTranslation } from '../../../../../../lib/withT'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import LoadingPlaceholder from '../shared/LoadingPlaceholder'
import FilterButton from './FilterButton'
import { useMe } from '../../../../../../lib/context/MeContext'

const styles = {
  filters: css({
    marginTop: 12,
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
  const [filter, setFilter] = useState<'all' | 'read-aloud'>('all')
  const { t } = useTranslation()
  const { hasAccess } = useMe()
  const { data, loading, error } = useLatestArticlesQuery({
    variables: {
      count: 20,
    },
  })
  const { addAudioQueueItem, checkIfInQueue, checkIfActiveItem } =
    useAudioQueue()

  const hasReadAloudDocuments =
    data?.latestArticles?.nodes.some(
      (node) => node?.meta?.audioSource?.kind === 'readAloud',
    ) || false
  if (hasReadAloudDocuments && filter !== 'all') {
    setFilter('all')
  }

  const handlePlay = async (documentId: string) => {
    await addAudioQueueItem({
      variables: {
        entity: {
          id: documentId,
          type: 'Document',
        },
        sequence: 1,
      },
    })
    // TODO: handle error
  }

  const handleAddToQueue = async (documentId: string) => {
    await addAudioQueueItem({
      variables: {
        entity: {
          id: documentId,
          type: 'Document',
        },
      },
    })
    // TODO: handle error
  }

  const filteredArticles = useMemo(() => {
    const articleWithAudio = data?.latestArticles?.nodes.filter(
      (article) => !!article?.meta?.audioSource,
    )

    return articleWithAudio?.filter((article) => {
      if (filter === 'all') {
        return true
      }
      return article?.meta?.audioSource?.kind === 'readAloud'
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
    <div>
      {hasReadAloudDocuments && (
        <div {...styles.filters}>
          <FilterButton
            isActive={filter === 'read-aloud'}
            onClick={() => setFilter('read-aloud')}
          >
            {t('AudioPlayer/Latest/ReadAloud')}
          </FilterButton>
          <FilterButton
            isActive={filter === 'all'}
            onClick={() => setFilter('all')}
          >
            {t('AudioPlayer/Latest/All')}
          </FilterButton>
        </div>
      )}
      <ul {...styles.list}>
        {filteredArticles.map((article) => (
          <li key={article.id}>
            <AudioListItem
              item={article}
              isActive={checkIfActiveItem(article.id)}
              beforeActionItem={
                <IconButton
                  Icon={PlaylistAddIcon}
                  title={t('AudioPlayer/Queue/Add')}
                  onClick={() => handleAddToQueue(article.id)}
                  disabled={checkIfInQueue(article.id)}
                  style={{ marginRight: 0 }}
                />
              }
              actions={[
                {
                  Icon: DownloadIcon,
                  label: t('AudioPlayer/Queue/Download'),
                  onClick: () => handleDownload(article),
                },
                {
                  Icon: LinkIcon,
                  label: t('AudioPlayer/Queue/GoToItem'),
                  onClick: () => handleOpenArticle(article.meta.path),
                },
              ]}
              onClick={() => handlePlay(article.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}

export default LatestArticlesTab

import { ReactNode, useMemo, useState } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  PlaylistAddIcon,
  DownloadIcon,
  LinkIcon,
  fontStyles,
  useColorContext,
} from '@project-r/styleguide'
import AudioListItem from './AudioListItem'
import useAudioQueue from '../../../hooks/useAudioQueue'
import { useLatestArticlesQuery } from '../../../graphql/LatestArticlesHook'
import { useTranslation } from '../../../../../lib/withT'
import { AudioQueueItem } from '../../../graphql/AudioQueueHooks'
import LoadingPlaceholder from './LoadingPlaceholder'

const styles = {
  filterButton: css({
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    ...fontStyles.sansSerifBold,
    fontWeight: 'bold',
  }),
  filters: css({
    marginTop: 12,
    display: 'flex',
    gap: 8,
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

type FilterButtonProps = {
  children?: ReactNode
  isActive?: boolean
  onClick: () => void
}

const FilterButton = ({ children, onClick, isActive }: FilterButtonProps) => {
  const [colorScheme] = useColorContext()
  return (
    <button
      onClick={() => onClick()}
      {...styles.filterButton}
      {...colorScheme.set('color', isActive ? 'text' : 'disabled')}
    >
      {children}
    </button>
  )
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
  const { data, loading, error } = useLatestArticlesQuery({
    variables: {
      count: 20,
    },
  })
  const { addAudioQueueItem, checkIfInQueue, checkIfActiveItem } =
    useAudioQueue()

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

  if (loading) {
    return <LoadingPlaceholder />
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <div>
      <div {...styles.filters}>
        <FilterButton
          isActive={filter === 'read-aloud'}
          onClick={() => setFilter('read-aloud')}
        >
          Vorgelesen
        </FilterButton>
        <FilterButton
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        >
          Alle
        </FilterButton>
      </div>
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

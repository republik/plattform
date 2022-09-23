import { useMemo } from 'react'
import { css } from 'glamor'
import {
  IconButton,
  PlaylistAddIcon,
  DownloadIcon,
  LinkIcon,
} from '@project-r/styleguide'
import AudioListItem from './AudioListItem'
import useAudioQueue from '../../hooks/useAudioQueue'
import { useLatestArticlesQuery } from '../../graphql/LatestArticlesHook'
import { useTranslation } from '../../../../lib/withT'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'

const styles = {
  list: css({
    listStyle: 'none',
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
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
    return data?.latestArticles?.nodes.filter(
      (article) => !!article?.meta?.audioSource,
    )
  }, [data])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
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
  )
}

export default LatestArticlesTab

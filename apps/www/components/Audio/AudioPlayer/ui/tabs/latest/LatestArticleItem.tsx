import AudioListItem from '../shared/AudioListItem'

import {
  IconButton,
  PlaylistAddIcon,
  DownloadIcon,
  LinkIcon,
  Spinner,
} from '@project-r/styleguide'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import { AudioPlayerItem } from '../../../../types/AudioPlayerItem'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import { useTranslation } from '../../../../../../lib/withT'
import { useState } from 'react'
import { useAudioContext } from '../../../../AudioProvider'

type ArticleItemProps = {
  article: AudioQueueItem['document']
  handleOpenArticle: (path: string) => Promise<void>
  handleDownload: (item: AudioQueueItem['document']) => Promise<void>
}

const LatestArticleItem = ({
  article,
  handleOpenArticle,
  handleDownload,
}: ArticleItemProps) => {
  const { t } = useTranslation()
  const { toggleAudioPlayer, addAudioQueueItem } = useAudioContext()
  const { checkIfInQueue, checkIfActiveItem, getAudioQueueItemIndex } =
    useAudioQueue()
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = async (article: AudioPlayerItem) => {
    try {
      setIsLoading(true)
      toggleAudioPlayer(article)
      setIsLoading(false)
    } catch (error) {
      // TODO: handle error
    }
  }

  const handleAddToQueue = async (
    article: AudioPlayerItem,
    position?: number,
  ) => {
    try {
      setIsLoading(true)
      await addAudioQueueItem(article, position)
      setIsLoading(false)
    } catch (error) {
      // TODO: handle error
    }
  }

  return (
    <AudioListItem
      item={article}
      isActive={!!checkIfActiveItem(article.id)}
      beforeActionItem={
        isLoading ? (
          <div style={{ position: 'relative', width: 24, height: 24 }}>
            <Spinner size={24} />
          </div>
        ) : (
          <IconButton
            Icon={PlaylistAddIcon}
            title={t('AudioPlayer/Queue/Add')}
            onClick={() => handleAddToQueue(article)}
            disabled={checkIfInQueue(article.id)}
            style={{ marginRight: 0, alignSelf: 'stretch' }}
          />
        )
      }
      actions={[
        {
          Icon: PlaylistAddIcon,
          label: t('AudioPlayer/Queue/AddToQueueAsNext'),
          onClick: () => handleAddToQueue(article, 2),
          hidden:
            checkIfInQueue(article.id) &&
            getAudioQueueItemIndex(article.id) <= 1,
        },
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
      onClick={() => handlePlay(article)}
    />
  )
}

export default LatestArticleItem

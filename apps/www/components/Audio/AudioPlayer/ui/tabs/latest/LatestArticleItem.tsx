import AudioListItem from '../shared/AudioListItem'

import {
  IconButton,
  Spinner,
} from '@project-r/styleguide'
import { AudioQueueItem } from '../../../../graphql/AudioQueueHooks'
import { AudioPlayerItem } from '../../../../types/AudioPlayerItem'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import { useTranslation } from '../../../../../../lib/withT'
import { useState } from 'react'
import { useAudioContext } from '../../../../AudioProvider'
import {
  AudioPlayerLocations,
  AudioPlayerActions,
} from '../../../../types/AudioActionTracking'
import { trackEvent } from '../../../../../../lib/matomo'
import { IconDownload, IconLink, IconPlaylistAdd } from '@republik/icons'

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
  const { checkIfInQueue, checkIfHeadOfQueue, getAudioQueueItemIndex } =
    useAudioQueue()
  const [isLoading, setIsLoading] = useState(false)

  const handlePlay = async (article: AudioPlayerItem) => {
    try {
      setIsLoading(true)
      toggleAudioPlayer(article, AudioPlayerLocations.AUDIO_PLAYER)
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

      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        position === 2
          ? AudioPlayerActions.ADD_NEXT_QUEUE_ITEM
          : AudioPlayerActions.ADD_QUEUE_ITEM,
        article?.meta?.path,
      ])
    } catch (error) {
      // TODO: handle error
    }
  }

  return (
    <AudioListItem
      item={article}
      isActive={!!checkIfHeadOfQueue(article.id)}
      beforeActionItem={
        isLoading ? (
          <div style={{ position: 'relative', width: 24, height: 24 }}>
            <Spinner size={24} />
          </div>
        ) : (
          <IconButton
            Icon={IconPlaylistAdd}
            title={t('AudioPlayer/Queue/Add')}
            onClick={() => handleAddToQueue(article)}
            disabled={checkIfInQueue(article.id)}
            style={{ marginRight: 0, alignSelf: 'stretch' }}
          />
        )
      }
      actions={[
        {
          Icon: IconPlaylistAdd,
          label: t('AudioPlayer/Queue/AddToQueueAsNext'),
          onClick: () => handleAddToQueue(article, 2),
          hidden:
            checkIfInQueue(article.id) &&
            getAudioQueueItemIndex(article.id) <= 1,
        },
        {
          Icon: IconDownload,
          label: t('AudioPlayer/Queue/Download'),
          onClick: () => handleDownload(article),
        },
        {
          Icon: IconLink,
          label: t('AudioPlayer/Queue/GoToItem'),
          onClick: () => handleOpenArticle(article.meta.path),
        },
      ]}
      onClick={() => handlePlay(article)}
    />
  )
}

export default LatestArticleItem

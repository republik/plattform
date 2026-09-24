import AudioListItem from '../shared/AudioListItem'

import { collectionsDocumentId } from '@/app/(sanity)/components/article-actions/document-id'
import { AudioQueueItemContent } from '@/app/(sanity)/groq/audio-queue-items-query'
import { trackEvent } from '@/app/lib/analytics/event-tracking'
import { useTranslation } from '@/lib/withT'
import { IconButton, Spinner } from '@project-r/styleguide'
import { IconDownload, IconLink, IconPlaylistAdd } from '@republik/icons'
import { useState } from 'react'
import { useAudioContext } from '../../../../AudioProvider'
import useAudioQueue from '../../../../hooks/useAudioQueue'
import {
  AudioPlayerActions,
  AudioPlayerLocations,
} from '../../../../types/AudioActionTracking'

type ArticleItemProps = {
  article: AudioQueueItemContent
  handleOpenArticle: (path: string) => Promise<void>
  handleDownload: (item: AudioQueueItemContent) => Promise<void>
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

  const documentId = collectionsDocumentId(article)
  const queueItem = checkIfInQueue(documentId)

  const handlePlay = async () => {
    try {
      setIsLoading(true)
      toggleAudioPlayer(article, AudioPlayerLocations.AUDIO_PLAYER)
      setIsLoading(false)
    } catch (error) {
      // TODO: handle error
    }
  }

  const handleAddToQueue = async (position?: number) => {
    try {
      setIsLoading(true)
      await addAudioQueueItem(article, position)
      setIsLoading(false)

      trackEvent([
        AudioPlayerLocations.AUDIO_PLAYER,
        position === 2
          ? AudioPlayerActions.ADD_NEXT_QUEUE_ITEM
          : AudioPlayerActions.ADD_QUEUE_ITEM,
        article.slug,
      ])
    } catch (error) {
      // TODO: handle error
    }
  }

  return (
    <AudioListItem
      item={article}
      userProgress={queueItem?.userProgress}
      isActive={!!checkIfHeadOfQueue(documentId)}
      beforeActionItem={
        isLoading ? (
          <div style={{ position: 'relative', width: 24, height: 24 }}>
            <Spinner size={24} />
          </div>
        ) : (
          <IconButton
            Icon={IconPlaylistAdd}
            title={t('AudioPlayer/Queue/Add')}
            onClick={() => handleAddToQueue()}
            disabled={!!queueItem}
            style={{ marginRight: 0, alignSelf: 'stretch' }}
          />
        )
      }
      actions={[
        {
          Icon: IconPlaylistAdd,
          label: t('AudioPlayer/Queue/AddToQueueAsNext'),
          onClick: () => handleAddToQueue(2),
          hidden: !!queueItem && getAudioQueueItemIndex(documentId) <= 1,
        },
        {
          Icon: IconDownload,
          label: t('AudioPlayer/Queue/Download'),
          onClick: () => handleDownload(article),
        },
        {
          Icon: IconLink,
          label: t('AudioPlayer/Queue/GoToItem'),
          onClick: () => handleOpenArticle(article.slug),
        },
      ]}
      onClick={handlePlay}
    />
  )
}

export default LatestArticleItem

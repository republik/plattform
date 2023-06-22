import {
  IconButton,
  convertStyleToRem,
  fontStyles,
  mediaQueries,
  useColorContext,
} from '@project-r/styleguide'
import {
  IconPauseCircleOutline,
  IconPlayCircleOutline,
  IconPlaylistAdd,
  IconPlaylistRemove,
} from '@republik/icons'
import { css } from 'glamor'
import { useEffect, useState } from 'react'
import { useTranslation } from '../../../lib/withT'
import Time from '../../Audio/AudioPlayer/ui/Time'
import { useAudioContext } from '../../Audio/AudioProvider'
import { useMediaProgress } from '../../Audio/MediaProgress'
import { useGlobalAudioState } from '../../Audio/globalAudioState'
import useAudioQueue from '../../Audio/hooks/useAudioQueue'
import { AudioPlayerLocations } from '../../Audio/types/AudioActionTracking'
import Info from './Info'

const styles = {
  container: css({
    padding: 12,
    background: '#eee',
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'stretch',
    gap: 12,
  }),
  labels: css({
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    flexGrow: '1',
    ...convertStyleToRem(fontStyles.sansSerifRegular14),
    [mediaQueries.mUp]: {
      ...convertStyleToRem(fontStyles.sansSerifRegular15),
    },
  }),
}

type Props = {
  document: any
}

export const ArticleAudioPlayer = ({ document }: Props) => {
  const {
    toggleAudioPlayer,
    toggleAudioPlayback,
    addAudioQueueItem,
    removeAudioQueueItem,
    checkIfActivePlayerItem,
    isPlaying,
  } = useAudioContext()
  const { t } = useTranslation()
  const [colorScheme] = useColorContext()

  const { currentTime } = useGlobalAudioState()
  const { isAudioQueueAvailable, checkIfInQueue } = useAudioQueue()

  const isActiveAudioItem = checkIfActivePlayerItem(document.id)
  const itemPlaying = isPlaying && isActiveAudioItem
  const itemInAudioQueue = checkIfInQueue(document.id)
  const { getMediaProgress } = useMediaProgress()

  const [mediaProgress, setMediaProgress] = useState(0)

  const currentDisplayTime =
    isActiveAudioItem && currentTime > 0 ? currentTime : mediaProgress
  const duration = document.meta.audioSource.durationMs / 1000

  useEffect(() => {
    const updateMediaProgress = async () => {
      const mp = await getMediaProgress({
        mediaId: document.meta.audioSource.mediaId,
        durationMs: document.meta.audioSource.durationMs,
      })
      setMediaProgress(mp || 0)
    }

    if (currentTime === 0) {
      updateMediaProgress()
    }
  }, [document.meta.audioSource.mediaId, currentTime])

  const play = () => {
    toggleAudioPlayer(document, AudioPlayerLocations.ACTION_BAR)
  }

  return (
    <div {...styles.container} {...colorScheme.set('background', 'hover')}>
      <IconButton
        Icon={itemPlaying ? IconPauseCircleOutline : IconPlayCircleOutline}
        size={42}
        title={t(`styleguide/AudioPlayer/${isPlaying ? 'pause' : 'play'}`)}
        onClick={() => {
          if (isActiveAudioItem) {
            toggleAudioPlayback()
          } else {
            play()
          }
        }}
        style={{ marginRight: 0 }}
      />
      <div {...styles.labels}>
        <Info document={document} handlePlay={play} />
        <Time currentTime={currentDisplayTime} duration={duration} />
      </div>

      <IconButton
        Icon={itemInAudioQueue ? IconPlaylistRemove : IconPlaylistAdd}
        title={
          itemInAudioQueue
            ? t('AudioPlayer/Queue/Remove')
            : t('AudioPlayer/Queue/Add')
        }
        onClick={async (e) => {
          e.preventDefault()
          if (itemInAudioQueue) {
            await removeAudioQueueItem(itemInAudioQueue.id)
            //  trackEvent([
            //       AudioPlayerLocations.ACTION_BAR,
            //       AudioPlayerActions.REMOVE_QUEUE_ITEM,
            //       meta?.path,
            //     ])
          } else {
            await addAudioQueueItem(document)
            // trackEvent([
            //   AudioPlayerLocations.ACTION_BAR,
            //   AudioPlayerActions.ADD_QUEUE_ITEM,
            //   meta?.path,
            // ])
          }
        }}
        style={{ marginRight: 0 }}
      />
    </div>
  )
}

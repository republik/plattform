import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'
import AudioCover from './AudioCover'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  coverWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  detailWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  }),
  metaWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  dateText: css({
    ...fontStyles.sansSerifRegular12,
  }),
}

type CurrentlyPlayingProps = {
  t: any
  item: AudioQueueItem
  handleOpen: (path: string) => void
}

const CurrentlyPlaying = ({ t, item, handleOpen }: CurrentlyPlayingProps) => {
  const [colorScheme] = useColorContext()

  const {
    document: {
      meta: {
        title,
        publishDate,
        audioSource,
        image,
        path,
        format,
        audioCoverCrop,
      },
    },
  } = item
  const { durationMs } = audioSource
  return (
    <div>
      <div {...styles.root}>
        <div {...styles.coverWrapper}>
          <AudioCover
            size={90}
            image={image}
            format={format?.meta}
            audioCoverCrop={audioCoverCrop}
          />
        </div>
        <div {...styles.detailWrapper}>
          {title && (
            <AudioPlayerTitle
              title={title}
              onClick={() => handleOpen(path)}
              lineClamp={3}
              fontSize={19}
            />
          )}
          <div {...styles.metaWrapper} {...colorScheme.set('color', 'text')}>
            <span {...styles.dateText}>
              {publishDate && dateFormatter(new Date(Date.parse(publishDate)))}{' '}
              - {formatMinutes(durationMs / 1000)}min
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyPlaying

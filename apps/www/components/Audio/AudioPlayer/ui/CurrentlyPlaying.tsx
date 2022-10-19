import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { dateFormatter, formatMinutes } from '../shared'
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
    gap: 12,
    ...fontStyles.sansSerifRegular12,
  }),
}

type CurrentlyPlayingProps = {
  item: AudioQueueItem
  handleOpen: (path: string) => void
}

const CurrentlyPlaying = ({ item, handleOpen }: CurrentlyPlayingProps) => {
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
            <span>
              {publishDate && dateFormatter(new Date(Date.parse(publishDate)))}
            </span>
            <span>{formatMinutes(durationMs / 1000)}min</span>
            <span
              style={{
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                WebkitLineClamp: 1,
                wordBreak: 'break-all',
              }}
            >
              {item.document?.meta?.audioSource.kind === 'syntheticReadAloud' &&
                'synthetisch'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyPlaying

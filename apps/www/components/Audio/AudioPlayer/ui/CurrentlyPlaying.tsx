import React from 'react'
import { css } from 'glamor'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { dateFormatter, FALLBACK_IMG_SRC, formatMinutes } from '../shared'
import AudioPlayerTitle from './AudioPlayerTitle'
import { AudioPlayerItem } from '../../types/AudioPlayerItem'
import { AudioQueueItem } from '../../graphql/AudioQueueHooks'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: 16,
  }),
  heading: css({
    ...fontStyles.sansSerifMedium16,
    lineHeight: '20px',
    marginBottom: 24,
    marginTop: 0,
  }),
  coverWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  cover: css({
    aspectRatio: '1 / 1',
    objectFit: 'cover',
    width: 90,
    height: 'auto',
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
      meta: { title, publishDate, audioSource, image, path },
    },
  } = item
  const { durationMs } = audioSource
  const cover = imageResizeUrl(image, '250x') || FALLBACK_IMG_SRC

  return (
    <div>
      <p {...styles.heading}>{t('AudioPlayer/Queue/ActiveHeading')}</p>
      <div {...styles.root}>
        <div {...styles.coverWrapper}>
          <img {...styles.cover} src={cover} />
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

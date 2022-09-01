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
    gap: '1rem',
  }),
  heading: css({
    ...fontStyles.sansSerifMedium16,
    marginBottom: '0.5rem',
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
    width: '5rem',
    height: 'auto',
  }),
  detailWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  }),
  metaWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  }),
  dateText: css({
    ...fontStyles.sansSerifRegular14,
  }),
}

type CurrentlyPlayingProps = {
  t: any
  item: AudioQueueItem
}

const CurrentlyPlaying = ({ t, item }: CurrentlyPlayingProps) => {
  const [colorScheme] = useColorContext()

  const {
    document: {
      meta: { title, path, publishDate, audioSource, image },
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
          {title && <AudioPlayerTitle title={title} path={path} />}
          <div
            {...styles.metaWrapper}
            {...colorScheme.set('color', 'textSoft')}
          >
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

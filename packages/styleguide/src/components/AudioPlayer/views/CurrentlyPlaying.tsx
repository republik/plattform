import React from 'react'
import Time from './Time'
import { css } from 'glamor'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  }),
  cover: css({
    aspectRatio: 1,
    width: '100%',
    maxWidth: '5rem',
    height: 'auto',
  }),
  detailWrapper: css({
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '1rem',
  }),
  metaWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
  }),
}

type CurrentlyPlayingProps = {
  t: any
  currentTime: number
  duration: number
  title: string
  sourcePath?: string
  date: string
}

const CurrentlyPlaying = ({
  title,
  sourcePath,
  date,
  currentTime,
  duration,
}: CurrentlyPlayingProps) => {
  return (
    <div {...styles.root}>
      <div>
        <img
          {...styles.cover}
          src='https://www.billboard.com/wp-content/uploads/2022/03/6.-Pink-Floyd-%E2%80%98Dark-Side-of-the-Moon-1973-album-art-billboard-1240.jpg?w=1024'
        />
      </div>
      <div {...styles.detailWrapper}>
        <span>{title}</span>
        <div {...styles.metaWrapper}>
          <span>date</span>
          <span>
            <Time currentTime={currentTime} duration={duration} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyPlaying

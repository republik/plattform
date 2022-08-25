import React from 'react'
import Time from './Time'
import { css } from 'glamor'
import { sansSerifRegular14, sansSerifRegular15 } from '../../Typography/styles'
import { underline } from '../../../lib/styleMixins'
import Link from 'next/link'
import { useColorContext } from '../../Colors/ColorContext'

const styles = {
  root: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  }),
  coverWrapper: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  }),
  cover: css({
    aspectRatio: 1,
    width: '100%',
    maxWidth: '4rem',
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
  title: css({
    ...sansSerifRegular15,
    textDecoration: 'none',
    '&[href]:hover': {
      ...underline,
    },
  }),
  dateText: css({
    ...sansSerifRegular14,
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
  const [colorScheme] = useColorContext()

  return (
    <div {...styles.root}>
      <div {...styles.coverWrapper}>
        <img
          {...styles.cover}
          src='https://www.billboard.com/wp-content/uploads/2022/03/6.-Pink-Floyd-%E2%80%98Dark-Side-of-the-Moon-1973-album-art-billboard-1240.jpg?w=1024'
        />
      </div>
      <div {...styles.detailWrapper}>
        {title &&
          (sourcePath ? (
            <Link href={sourcePath} passHref>
              <a {...styles.title} {...colorScheme.set('color', 'text')}>
                {title}
              </a>
            </Link>
          ) : (
            <span {...styles.title}>{title}</span>
          ))}{' '}
        <div {...styles.metaWrapper}>
          <span {...styles.dateText} {...colorScheme.set('color', 'textSoft')}>
            01.01.2020
          </span>{' '}
          {/* TODO: make dynamic */}
          <span>
            <Time currentTime={currentTime} duration={duration} />
          </span>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyPlaying

import React from 'react'
import { css } from 'glamor'
import Link from 'next/link'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { dateFormatter, formatMinutes } from '../shared'

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
    gap: '0.25rem',
  }),
  metaWrapper: css({
    display: 'flex',
    flexDirection: 'row',
    gap: '1rem',
  }),
  title: css({
    ...fontStyles.sansSerifRegular15,
    textDecoration: 'none',
    '&[href]:hover': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
  dateText: css({
    ...fontStyles.sansSerifRegular14,
  }),
}

type CurrentlyPlayingProps = {
  t: any
  duration: number
  title: string
  sourcePath?: string
  publishDate: string
}

const CurrentlyPlaying = ({
  title,
  sourcePath,
  publishDate,
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
        <div {...styles.metaWrapper} {...colorScheme.set('color', 'textSoft')}>
          <span {...styles.dateText}>
            {publishDate && dateFormatter(new Date(Date.parse(publishDate)))} -{' '}
            {formatMinutes(duration)}min
          </span>
        </div>
      </div>
    </div>
  )
}

export default CurrentlyPlaying

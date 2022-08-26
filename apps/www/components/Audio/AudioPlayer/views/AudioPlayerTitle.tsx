import Link from 'next/link'
import React from 'react'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  title: css({
    ...fontStyles.sansSerifRegular15,
    textDecoration: 'none',
    '&[href]:hover': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
    },
  }),
}

const AudioPlayerTitle = ({ title, path }) => {
  const [colorScheme] = useColorContext()

  if (path) {
    return (
      <Link href={path} passHref>
        <a {...styles.title} {...colorScheme.set('color', 'text')}>
          {title}
        </a>
      </Link>
    )
  }
  return <span {...styles.title}>{title}</span>
}

export default AudioPlayerTitle

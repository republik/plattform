import React from 'react'
import { fontStyles, useColorContext } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  title: css({
    ...fontStyles.sansSerifRegular,
    lineHeight: '23px',
    textDecoration: 'none',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    '&[href]:hover': {
      textDecoration: 'underline',
    },
  }),
  buttonFix: css({
    color: 'inherit',
    border: 'none',
    padding: 0,
    font: 'inherit',
    outline: 'inherit',
    textAlign: 'start',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    '&:hover > *': {
      textDecoration: 'underline',
    },
  }),
}

type AudioPlayerTitleProps = {
  title: string
  onClick?: () => void
  lineClamp?: number
  fontSize?: number
}

const AudioPlayerTitle = ({
  title,
  onClick,
  lineClamp = 2,
  fontSize = 16,
}: AudioPlayerTitleProps) => {
  const [colorScheme] = useColorContext()
  const titleElement = (
    <span
      {...styles.title}
      {...colorScheme.set('color', 'text')}
      {...css({
        WebkitLineClamp: lineClamp,
        fontSize: fontSize,
        lineHeight: `${fontSize * 1.2}px`,
      })}
    >
      {title}
    </span>
  )

  if (!onClick) return titleElement

  return (
    <button {...styles.buttonFix} onClick={onClick}>
      {titleElement}
    </button>
  )
}

export default AudioPlayerTitle

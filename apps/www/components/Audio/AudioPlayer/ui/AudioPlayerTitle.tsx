import React from 'react'
import { fontStyles } from '@project-r/styleguide'
import { css } from 'glamor'

const styles = {
  title: css({
    ...fontStyles.sansSerifRegular15,
    textDecoration: 'none',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
    '&[href]:hover': {
      textDecoration: 'underline',
      textDecorationSkip: 'ink',
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
      textDecorationSkip: 'ink',
    },
  }),
}

type AudioPlayerTitleProps = {
  title: string
  onClick?: () => void
}

const AudioPlayerTitle = ({ title, onClick }: AudioPlayerTitleProps) => {
  const titleElement = <span {...styles.title}>{title}</span>

  if (!onClick) return titleElement

  return (
    <button {...styles.buttonFix} onClick={onClick}>
      {titleElement}
    </button>
  )
}

export default AudioPlayerTitle

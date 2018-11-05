import React from 'react'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import { serifTitle20, sansSerifMedium20, cursiveTitle20 } from '../Typography/styles'

const smallSize = {
  fontSize: '26px',
  lineHeight: '32px',
  marginBottom: '16px'
}

const standardSize = {
  fontSize: '32px',
  lineHeight: '37px',
  marginBottom: '25px'
}

const mediumSize = {
  fontSize: '48px',
  lineHeight: '54px',
  marginBottom: '25px'
}

const styles = {
  base: css({
    margin: 0,
    marginBottom: 6,
    [mUp]: {
      marginBottom: 8
    }
  }),
  editorialCol2: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  editorialCol2Medium: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
    }
  }),
  editorialCol3: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  interactionCol2: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  interactionCol2Medium: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
    }
  }),
  interactionCol3: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  scribble: css({
    ...cursiveTitle20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  })
}

export const Editorial = ({ children, medium, columns }) => {
  const style = columns === 3
    ? styles.editorialCol3
    : medium
      ? styles.editorialCol2Medium
      : styles.editorialCol2
  return (
    <h1 {...styles.base} {...style}>
      {children}
    </h1>
  )
}

export const Interaction = ({ children, medium, columns }) => {
  const style = columns === 3
    ? styles.interactionCol3
    : medium
      ? styles.interactionCol2Medium
      : styles.interactionCol2
  return (
    <h1 {...styles.base} {...style}>
      {children}
    </h1>
  )
}

export const Scribble = ({ children }) => {
  return (
    <h1 {...styles.base} {...styles.scribble}>
      {children}
    </h1>
  )
}

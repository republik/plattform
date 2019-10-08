import React from 'react'
import { css } from 'glamor'
import { mUp } from './mediaQueries'
import {
  serifTitle20,
  sansSerifMedium20,
  cursiveTitle20
} from '../Typography/styles'
import { pxToRem } from '../Typography/utils'

const smallSize = {
  fontSize: pxToRem('26px'),
  lineHeight: pxToRem('32px'),
  marginBottom: '16px'
}

const standardSize = {
  fontSize: pxToRem('32px'),
  lineHeight: pxToRem('37px'),
  marginBottom: '25px'
}

const mediumSize = {
  fontSize: pxToRem('48px'),
  lineHeight: pxToRem('54px'),
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
  editorialCol1: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  editorialCol1Medium: css({
    ...serifTitle20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
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
  interactionCol1: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...standardSize
    }
  }),
  interactionCol1Medium: css({
    ...sansSerifMedium20,
    ...smallSize,
    [mUp]: {
      ...mediumSize
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
    [mUp]: {
      ...standardSize
    }
  })
}

export const Editorial = ({ children, medium, columns = 1 }) => {
  const headlineStyles = css(
    styles.base,
    medium
      ? styles[`editorialCol${columns}Medium`]
      : styles[`editorialCol${columns}`]
  )

  return <h1 {...headlineStyles}>{children}</h1>
}

export const Interaction = ({ children, medium, columns = 1 }) => {
  const headlineStyles = css(
    styles.base,
    medium
      ? styles[`interactionCol${columns}Medium`]
      : styles[`interactionCol${columns}`]
  )
  return <h1 {...headlineStyles}>{children}</h1>
}

export const Scribble = ({ children }) => (
  <h1 {...styles.base} {...styles.scribble}>
    {children}
  </h1>
)

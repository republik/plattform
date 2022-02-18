import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { serifTitle38, serifTitle58 } from '../Typography/styles'

const styles = {
  base: css({
    margin: 0,
    ...serifTitle38,
    marginBottom: '25px',
    [mUp]: {
      ...serifTitle58,
      marginBottom: '35px',
    },
  }),
}

const Headline = ({ children, poster, large, medium }) => {
  return (
    <h1 {...styles.base} {...styles.editorial}>
      {children}
    </h1>
  )
}

export default Headline

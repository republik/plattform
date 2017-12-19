import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { serifTitle20, serifTitle58 } from '../Typography/styles'

const styles = {
  base: css({
    margin: 0,
    ...serifTitle20,
    fontSize: '38px',
    lineHeight: '43px',
    marginBottom: '30px',
    [mUp]: {
      ...serifTitle58
    }
  })
}

const Headline = ({ children, poster, large, medium }) => {
  return (
    <h1 {...styles.base} {...styles.editorial}>
      {children}
    </h1>
  )
}

export default Headline

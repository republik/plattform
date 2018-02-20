import React from 'react'
import { css } from 'glamor'
import { link } from '../Typography/Editorial'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifRegular15, sansSerifRegular21 } from '../Typography/styles'

const styles = {
  more: css({
    ...sansSerifRegular15,
    display: 'block',
    minHeight: '15px',
    textAlign: 'center',
    [mUp]: {
      ...sansSerifRegular21,
    }
  })
}

const More = ({ children }) => {
  return <span {...styles.more} {...link}>{children}</span>
}

export default More

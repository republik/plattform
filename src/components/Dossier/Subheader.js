import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium16, sansSerifMedium20 } from '../Typography/styles'

const styles = {
  subheader: css({
    width: '100%',
    ...sansSerifMedium16,
    margin: '70px 0 30px 0',
    textAlign: 'center',
    [mUp]: {
      ...sansSerifMedium20,
      margin: '100px 0 70px 0',
    }
  })
}

const Subheader = ({ children }) => {
  return <h2 {...styles.subheader}>{children}</h2>
}

export default Subheader

import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium16, sansSerifMedium20 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  subheader: css({
    ...convertStyleToRem(sansSerifMedium16),
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium20)
    }
  }),
  spaced: css({
    width: '100%',
    margin: '70px 0 30px 0',
    textAlign: 'center',
    [mUp]: {
      margin: '100px 0 70px 0'
    }
  })
}

const Subheader = ({ children, singleColumn }) => {
  const [colorScheme] = useColorContext()
  const colors = css({
    color: colorScheme.text
  })

  return (
    <h2
      {...styles.subheader}
      {...(singleColumn ? {} : styles.spaced)}
      {...colors}
    >
      {children}
    </h2>
  )
}

export default Subheader

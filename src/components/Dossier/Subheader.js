import React from 'react'
import { css } from 'glamor'
import { mUp } from '../TeaserFront/mediaQueries'
import { sansSerifMedium16, sansSerifMedium20 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const styles = {
  subheader: css({
    width: '100%',
    ...convertStyleToRem(sansSerifMedium16),
    margin: '70px 0 30px 0',
    textAlign: 'center',
    [mUp]: {
      ...convertStyleToRem(sansSerifMedium20),
      margin: '100px 0 70px 0'
    }
  })
}

const Subheader = ({ children }) => {
  const [colorScheme] = useColorContext()
  const colors = css({
    color: colorScheme.text
  })

  return (
    <h2 {...styles.subheader} {...colors}>
      {children}
    </h2>
  )
}

export default Subheader

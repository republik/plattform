import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { sansSerifRegular14, sansSerifRegular15 } from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const styles = {
  main: css({
    margin: 0,
    ...convertStyleToRem(sansSerifRegular14),
    [mUp]: {
      ...convertStyleToRem(sansSerifRegular15)
    }
  })
}

const Credit = ({ children, color }) => {
  return (
    <p {...css(styles.main, { color: color || colors.text })}>{children}</p>
  )
}

Credit.propTypes = {
  children: PropTypes.node.isRequired
}

export default Credit

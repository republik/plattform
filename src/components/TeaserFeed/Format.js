import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium14, sansSerifMedium16 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  main: css({
    ...sansSerifMedium14,
    margin: '0 0 6px 0',
    [mUp]: {
      ...sansSerifMedium16,
      margin: '-5px 0 8px 0'
    }
  })
}

export const Format = ({ children, color }) => {
  return (
    <p {...styles.main} style={{ color }}>
      {children}
    </p>
  )
}

Format.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string
}

export default Format

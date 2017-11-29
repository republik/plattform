import React from 'react'
import PropTypes from 'prop-types'
import { sansSerifMedium14, sansSerifMedium16 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'
import { underline } from '../../lib/styleMixins'

const styles = {
  main: css({
    ...sansSerifMedium14,
    margin: '0 0 6px 0',
    [mUp]: {
      ...sansSerifMedium16,
      margin: '-5px 0 8px 0'
    },
    ...underline
  })
}

export const Format = ({ children, type }) => {
  const color = (type && colors[type]) || {}
  return (
    <p {...styles.main} style={{ color }}>
      {children}
    </p>
  )
}

Format.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf([null, 'editorial', 'meta', 'social'])
}

export default Format

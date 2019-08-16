import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { sansSerifMedium14 } from '../Typography/styles'

const styles = css({
  ...sansSerifMedium14,
  margin: '0 0 10px 0'
})

const Format = ({ children, color = colors.feuilleton }) => {
  const customStyles = css(styles, {
    color
  })

  return <div {...customStyles}>{children}</div>
}

export default Format

Format.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string
}
Format.defaultProps = {
  bigger: colors.feuilleton
}

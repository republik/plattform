import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'
import colors from '../../theme/colors'
import { sansSerifMedium14 } from '../Typography/styles'
import { useColorContext } from '../Colors/useColorContext'
const styles = css({
  ...sansSerifMedium14,
  margin: '0 0 10px 0'
})

const Format = ({ children, color = colors.feuilleton }) => {
  const [colorScheme] = useColorContext()
  return (
    <div {...colorScheme.set('color', color || 'text', 'format')} {...styles}>
      {children}
    </div>
  )
}

export default Format

Format.propTypes = {
  children: PropTypes.node,
  color: PropTypes.string
}
Format.defaultProps = {
  bigger: colors.feuilleton
}

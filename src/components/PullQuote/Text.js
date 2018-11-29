import React from 'react'
import PropTypes from 'prop-types'
import { serifBold24, serifBold28, serifBold42 } from '../Typography/styles'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { mUp } from '../../theme/mediaQueries'

const baseStyle = {
  ...serifBold24,
  color: colors.text
}

const styles = {
  default: css({
    ...baseStyle,
    [mUp]: {
      ...serifBold28
    }
  }),
  large: css({
    ...baseStyle,
    [mUp]: {
      ...serifBold42
    }
  })
}

export const Text = ({ children, attributes, size }) => {
  return (
    <div {...attributes} {...styles[size]}>
      {children}
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['default', 'large'])
}

Text.defaultProps = {
  size: 'default'
}

export default Text

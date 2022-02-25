import React from 'react'
import PropTypes from 'prop-types'
import { serifBold24, serifBold28, serifBold42 } from '../Typography/styles'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { convertStyleToRem } from '../Typography/utils'
import { useColorContext } from '../Colors/useColorContext'

const baseStyle = {
  ...convertStyleToRem(serifBold24),
}

const styles = {
  default: css({
    ...baseStyle,
    [mUp]: {
      ...convertStyleToRem(serifBold28),
    },
  }),
  large: css({
    ...baseStyle,
    [mUp]: {
      ...convertStyleToRem(serifBold42),
    },
  }),
}

export const Text = ({ children, attributes, size }) => {
  const [colorScheme] = useColorContext()
  return (
    <div
      {...attributes}
      {...colorScheme.set('color', 'text')}
      {...styles[size]}
    >
      {children}
    </div>
  )
}

Text.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['default', 'large']),
}

Text.defaultProps = {
  size: 'default',
}

export default Text

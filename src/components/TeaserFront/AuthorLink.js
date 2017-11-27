import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'
import { lab } from 'd3-color'
import { css } from 'glamor'
import colors from '../../theme/colors'

const AuthorLink = ({ children, color }) => {
  const labColor = lab(color)
  const style = css({
    color,
    cursor: 'pointer',
    ':hover': {
      color: labColor.b > 0.5 ? labColor.darker(0.6) : labColor.brighter(0.6)
    }
  })
  return (
    <Editorial.A {...style}>
      {children}
    </Editorial.A>
  )
}

AuthorLink.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string
}

AuthorLink.defaultProps = {
  color: colors.primary
}

export default AuthorLink

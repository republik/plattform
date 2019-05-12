import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'
import { lab } from 'd3-color'
import { css } from 'glamor'
import colors from '../../theme/colors'
import { underline } from '../../lib/styleMixins'
import { tUp } from './mediaQueries'

const CreditLink = ({ attributes, children, color, collapsedColor, ...props }) => {
  const labColor = lab(color)
  const labCollapsedColor = collapsedColor && lab(collapsedColor)

  const baseColorStyle = color ? {
    color,
    ':hover': {
      color: labColor.l > 50
        ? labColor.darker(0.6)
        : labColor.brighter(3)
    }
  } : {
    color: colors.text,
    ':hover': {
      color: colors.lightText
    }
  }

  const colorStyle = labCollapsedColor ? {
    color: collapsedColor,
    ':hover': {
      color: labCollapsedColor.l > 50 ? labCollapsedColor.darker(0.6) : labCollapsedColor.brighter(3)
    },
    [tUp]: {
      ...baseColorStyle
    }
  } : baseColorStyle

  const style = css({
    ...underline,
    cursor: 'pointer',
    ...colorStyle
  })
  return (
    <a {...attributes} {...props} {...style}>
      {children}
    </a>
  )
}

CreditLink.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  collapsedColor: PropTypes.string
}

CreditLink.defaultProps = {
  color: colors.primary
}

export default CreditLink

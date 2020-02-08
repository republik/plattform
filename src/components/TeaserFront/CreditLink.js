import React from 'react'
import PropTypes from 'prop-types'
import { lab } from 'd3-color'
import { css } from 'glamor'
import { underline } from '../../lib/styleMixins'
import { tUp } from './mediaQueries'
import { useColorContext } from '../Colors/useColorContext'

const getHoverColor = labColor =>
  labColor.l > 50 ? labColor.darker(0.6) : labColor.brighter(3)

const CreditLink = React.forwardRef(
  ({ attributes, children, color, collapsedColor, ...props }, ref) => {
    const [colorScheme] = useColorContext()
    const textColor = color ? color : colorScheme.text
    const labColor = lab(textColor)
    const labCollapsedColor = collapsedColor && lab(collapsedColor)
    const hoverColor = color ? getHoverColor(labColor) : colorScheme.lightText

    const baseColorStyle = {
      color: textColor,
      '@media (hover)': {
        ':hover': {
          color: hoverColor
        }
      }
    }

    const colorStyle = labCollapsedColor
      ? {
          color: collapsedColor,
          '@media (hover)': {
            ':hover': {
              color: getHoverColor(labCollapsedColor)
            }
          },
          [tUp]: {
            ...baseColorStyle
          }
        }
      : baseColorStyle

    const style = css({
      ...underline,
      cursor: 'pointer',
      ...colorStyle
    })
    return (
      <a {...attributes} {...props} {...style} ref={ref}>
        {children}
      </a>
    )
  }
)

CreditLink.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  collapsedColor: PropTypes.string
}

export default CreditLink

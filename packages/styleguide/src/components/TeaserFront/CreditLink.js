import React from 'react'
import { lab } from 'd3-color'
import { css } from 'glamor'
import { underline } from '../../lib/styleMixins'
import { tUp } from './mediaQueries'
import { useColorContext } from '../Colors/useColorContext'

const getHoverColor = (labColor) =>
  labColor.l > 50 ? labColor.darker(0.6) : labColor.brighter(3)

/**
 * @typedef {object} CreditLinkProps
 * @property {React.ReactNode} children
 * @property {string} [color]
 * @property {string} [collapsedColor]
 */

/**
 * CreditLink component
 * @param {CreditLinkProps} props
 * @returns {JSX.Element}
 */
const CreditLink = React.forwardRef(
  ({ attributes, children, color, collapsedColor, ...props }, ref) => {
    const [colorScheme] = useColorContext()
    const labCollapsedColor = collapsedColor && lab(collapsedColor)

    const baseColorStyle = {
      color: color || colorScheme.getCSSColor('text'),
      '@media (hover)': {
        ':hover': {
          color: color
            ? getHoverColor(lab(color))
            : colorScheme.getCSSColor('textSoft'),
        },
      },
    }

    const colorStyle = labCollapsedColor
      ? {
          color: collapsedColor,
          '@media (hover)': {
            ':hover': {
              color: getHoverColor(labCollapsedColor),
            },
          },
          [tUp]: {
            ...baseColorStyle,
          },
        }
      : baseColorStyle

    const style = css({
      ...underline,
      cursor: 'pointer',
      ...colorStyle,
    })
    return (
      <a {...attributes} {...props} {...style} ref={ref}>
        {children}
      </a>
    )
  },
)

export default CreditLink

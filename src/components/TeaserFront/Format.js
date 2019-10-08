import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { lab } from 'd3-color'
import { mUp, tUp } from './mediaQueries'
import {
  sansSerifMedium16,
  sansSerifMedium20
} from '../Typography/styles'
import { convertStyleToRem } from '../Typography/utils'

const format = css({
  ...convertStyleToRem(sansSerifMedium16),
  margin: '0 0 18px 0',
  [mUp]: {
    ...convertStyleToRem(sansSerifMedium20),
    margin: '0 0 28px 0'
  }
})

const Format = ({ children, color, collapsedColor }) => {
  const labColor = lab(color)
  const labCollapsedColor = lab(collapsedColor || color)
  const mixColorStyle = collapsedColor && css({
    color: labCollapsedColor.l > 50
      ? labCollapsedColor.darker(0.6)
      : labCollapsedColor.brighter(3.0),
    [tUp]: {
      color: labColor.l > 50 ? labColor.darker(2.0) : labColor.brighter(3.0),
    }
  })

  return (
    <p {...format} {...(mixColorStyle ? mixColorStyle : undefined)} style={!mixColorStyle ? {color} : undefined}>
      {children}
    </p>
  )
}

Format.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.string,
  collapsedColor: PropTypes.string
}

export default Format

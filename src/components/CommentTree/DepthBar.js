import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'

const borderWidth = 2

const marginLeftFirst = profilePictureSize / 2 - borderWidth / 2
const marginLeft = borderWidth / 2
const marginRight = profilePictureSize / 2 - borderWidth / 2 + profilePictureMargin

const FIRST_WIDTH = marginLeftFirst + marginRight + borderWidth
const WIDTH = marginLeft + marginRight + borderWidth

export const getWidth = (count) => {
  if (!count) {
    return 0
  }
  return FIRST_WIDTH + WIDTH * (count - 1)
}

const styles = {
  depthBar: css({
    width: 0,
    flexBasis: 0,
    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'stretch',
    borderLeft: `${borderWidth}px solid ${colors.primary}`,
    marginRight
  }),
  head: css({
    marginTop: 20 + profilePictureSize,
  }),
  tail: css({
    height: 20,
  })
}

const range = (n) => Array.from(new Array(n))

export const DepthBar = ({first, head, tail}) =>
  <div
    {...styles.depthBar}
    {...(head ? styles.head : {})} {...(tail ? styles.tail : {})}
    style={{marginLeft: first ? marginLeftFirst : marginLeft}}
  />

DepthBar.propTypes = {
  head: PropTypes.bool,
  tail: PropTypes.bool
}

export const DepthBars = ({count, head, tail}) =>
  range(count).map((_, index) => (
    <DepthBar
      key={index}
      first={index === 0}
      head={index === count - 1 && head}
      tail={index === count - 1 && tail}
    />
  ))

DepthBars.propTypes = {
  count: PropTypes.number.isRequired,
  head: PropTypes.bool,
  tail: PropTypes.bool
}

import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

import colors from '../../theme/colors'
import {profilePictureSize, profilePictureMargin} from '../Comment/CommentHeader'

const borderWidth = 2

const styles = {
  depthBar: css({
    width: 0,
    flexBasis: 0,
    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'stretch',
    borderLeft: `${borderWidth}px solid ${colors.primary}`,
    marginLeft: (profilePictureSize / 2 - borderWidth / 2),
    marginRight: (profilePictureSize / 2 - borderWidth / 2 + profilePictureMargin),
  }),
  head: css({
    marginTop: 20 + profilePictureSize,
  }),
  tail: css({
    height: 20,
  })
}

const range = (n) => Array.from(new Array(n))

export const DepthBar = ({head, tail}) =>
  <div
    {...styles.depthBar}
    {...(head ? styles.head : {})} {...(tail ? styles.tail : {})}
  />

DepthBar.propTypes = {
  head: PropTypes.bool.isRequired,
  tail: PropTypes.bool.isRequired
}

export const DepthBars = ({count, head, tail}) =>
  range(count).map((_, index) => (
    <DepthBar
      key={index}
      head={index === count - 1 && head}
      tail={index === count - 1 && tail}
    />
  ))

DepthBars.propTypes = {
  count: PropTypes.number.isRequired,
  head: PropTypes.bool.isRequired,
  tail: PropTypes.bool.isRequired
}

import React from 'react'
import PropTypes from 'prop-types'
import {css} from 'glamor'

const styles = {
  depthBar: css({
    width: 15,
    flexBasis: '15px',
    flexShrink: 0,
    flexGrow: 0,
    alignSelf: 'stretch',
    borderLeft: '1px solid #DBDBDB'
  }),
  head: css({
    marginTop: 20
  }),
  tail: css({
    marginBottom: 20
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

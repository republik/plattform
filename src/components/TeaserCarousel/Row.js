import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

import { PADDING, TILE_MARGIN_RIGHT } from './constants'

const styles = {
  container: css({
    margin: `0 -${PADDING}px`,
    paddingBottom: PADDING,
    width: 'auto',
    display: 'flex',
    flexDirection: 'row',
    overflowX: 'scroll',
    flexWrap: 'nowrap',
    scrollbarWidth: 'none' /* Firefox */,
    msOverflowStyle: 'none' /* IE 10+ */,
    WebkitOverflowScrolling: 'touch',
    '::-webkit-scrollbar': {
      width: 0,
      background: 'transparent'
    }
  }),
  pad: css({
    flexShrink: 0,
    width: PADDING,
    height: 1
  })
}

export const Row = ({ children }) => {
  return (
    <div role="group" {...styles.container}>
      <div {...styles.pad} />
      {children}
      <div {...styles.pad} style={{ width: PADDING - TILE_MARGIN_RIGHT }} />
    </div>
  )
}

export default Row

Row.propTypes = {
  children: PropTypes.node
}

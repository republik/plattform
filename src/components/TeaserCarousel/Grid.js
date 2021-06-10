import React from 'react'
import { css } from 'glamor'

import { TILE_GRID_PADDING } from './constants'

const styles = {
  container: css({
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: -TILE_GRID_PADDING,
    marginRight: -TILE_GRID_PADDING,
    width: `calc(100% + ${TILE_GRID_PADDING * 2}px)`
  })
}

const Grid = ({ children }) => {
  return (
    <div role='group' {...styles.container}>
      {children}
    </div>
  )
}

export default Grid

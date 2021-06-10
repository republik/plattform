import React, { useEffect, useRef } from 'react'
import { css } from 'glamor'
import scrollIntoView from 'scroll-into-view'

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

const Grid = ({ initialScrollTileIndex, children }) => {
  const overflow = useRef()

  useEffect(() => {
    if (!initialScrollTileIndex) {
      return
    }
    const scroller = overflow.current
    const target = Array.from(scroller.children)[initialScrollTileIndex]
    scrollIntoView(target, {
      time: 100,
      top: 0,
      topOffset: 100
    })
  }, [initialScrollTileIndex])

  return (
    <div role='group' ref={overflow} {...styles.container}>
      {children}
    </div>
  )
}

export default Grid

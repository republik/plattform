import React, { useEffect, useRef } from 'react'
import { css } from 'glamor'

import { TILE_GRID_PADDING } from './constants'

const styles = {
  container: css({
    display: 'flex',
    flexWrap: 'wrap',
    marginLeft: -TILE_GRID_PADDING,
    marginRight: -TILE_GRID_PADDING,
    width: `calc(100% + ${TILE_GRID_PADDING * 2}px)`
  }),
  seriesNav: css({
    height: '100%',
    overflowY: 'scroll'
  })
}

const Grid = ({ initialScrollTileIndex, children, isSeriesNav }) => {
  const overflow = useRef()

  useEffect(() => {
    if (!initialScrollTileIndex || !isSeriesNav) {
      return
    }
    const scroller = overflow.current
    const target = Array.from(scroller.children)[initialScrollTileIndex]
    scroller.scrollTop += target.getBoundingClientRect().top
  }, [initialScrollTileIndex])

  return (
    <div
      role='group'
      ref={overflow}
      {...styles.container}
      {...(isSeriesNav && styles.seriesNav)}
    >
      {children}
    </div>
  )
}

export default Grid

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
  }),
  overflow: css({
    overflowY: 'scroll'
  })
}

const Grid = ({ initialScrollTile, height, children }) => {
  const overflow = useRef()

  useEffect(() => {
    if (!initialScrollTile) {
      return
    }
    const scroller = overflow.current
    const target = Array.from(scroller.children)[initialScrollTile]
    console.log(overflow.current)
    scrollIntoView(target, {
      time: 400,
      top: 0,
      topOffset: 100
    })
  }, [initialScrollTile])

  return (
    <div
      role='group'
      ref={overflow}
      {...styles.container}
      style={{
        height
      }}
      {...(height && styles.overflow)}
    >
      {children}
    </div>
  )
}

export default Grid

import React, { useContext } from 'react'

import CarouselContext from './Context'
import Grid from './Grid'
import Row from './Row'

const Container = ({
  initialScrollTileIndex,
  children,
  height,
  style,
  overflowStyle
}) => {
  const context = useContext(CarouselContext)
  if (context.grid) {
    return (
      <Grid initialScrollTileIndex={initialScrollTileIndex} height={height}>
        {children}
      </Grid>
    )
  }
  return (
    <Row
      initialScrollTileIndex={initialScrollTileIndex}
      style={style}
      overflowStyle={overflowStyle}
    >
      {children}
    </Row>
  )
}

export default Container

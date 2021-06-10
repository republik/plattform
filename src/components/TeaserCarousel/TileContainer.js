import React, { useContext } from 'react'

import CarouselContext from './Context'
import Grid from './Grid'
import Row from './Row'

const Container = ({
  initialScrollTileIndex,
  children,
  isSeriesNav,
  overflowCentered
}) => {
  const context = useContext(CarouselContext)
  if (context.grid) {
    return (
      <Grid
        initialScrollTileIndex={initialScrollTileIndex}
        isSeriesNav={isSeriesNav}
      >
        {children}
      </Grid>
    )
  }
  return (
    <Row
      initialScrollTileIndex={initialScrollTileIndex}
      isSeriesNav={isSeriesNav}
      overflowCentered={overflowCentered}
    >
      {children}
    </Row>
  )
}

export default Container

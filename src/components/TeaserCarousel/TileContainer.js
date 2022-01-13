import React, { useContext } from 'react'

import CarouselContext from './Context'
import Grid from './Grid'
import Row from './Row'

const Container = ({ initialScrollTileIndex, children, isSeriesNav }) => {
  const context = useContext(CarouselContext)
  if (context.grid) {
    return <Grid>{children}</Grid>
  }
  return (
    <Row
      initialScrollTileIndex={initialScrollTileIndex}
      isSeriesNav={isSeriesNav}
    >
      {children}
    </Row>
  )
}

export default Container

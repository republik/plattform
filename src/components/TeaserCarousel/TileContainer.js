import React, { useContext } from 'react'

import CarouselContext from './Context'
import Grid from './Grid'
import Row from './Row'

const Container = ({ children }) => {
  const context = useContext(CarouselContext)
  if (context.grid) {
    return <Grid>{children}</Grid>
  }
  return <Row>{children}</Row>
}

export default Container

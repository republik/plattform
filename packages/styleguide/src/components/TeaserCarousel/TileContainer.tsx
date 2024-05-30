import React, { useContext } from 'react'

import CarouselContext from './Context'
import Grid from './Grid'
import Row from './Row'

type ContainerProps = {
  children: React.ReactNode
} & Pick<
  React.ComponentPropsWithoutRef<typeof Row>,
  'initialScrollTileIndex' | 'isSeriesNav'
>

const Container = ({
  initialScrollTileIndex,
  children,
  isSeriesNav,
}: ContainerProps) => {
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

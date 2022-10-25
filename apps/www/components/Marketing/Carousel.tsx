import React from 'react'
import { mediaQueries } from '@project-r/styleguide'
import { css } from 'glamor'

const Carousel = () => (
  <div {...styles.carousel} style={{ backgroundColor: 'red' }} />
)

const styles = {
  carousel: css({
    width: '100%',
    aspectRatio: '4/3',
    [mediaQueries.mUp]: {
      width: '80%',
    },
  }),
}

export default Carousel

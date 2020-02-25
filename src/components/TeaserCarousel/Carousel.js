import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

import CarouselContext, { defaultValue } from './Context'
import { PADDING, TILE_MAX_WIDTH } from './constants'

import { MAX_WIDTH } from '../Center'

const styles = {
  carousel: css({
    padding: `30px ${PADDING}px ${30 - PADDING}px`
  })
}

export const Carousel = ({
  bgColor,
  color,
  outline,
  bigger,
  children,
  tileCount: tileCountFromProps,
  article,
  grid
}) => {
  const row = children && children[1]
  const tileCount =
    tileCountFromProps ||
    (row && React.Children.count(row.props && row.props.children))
  const tileMaxWidth = grid
    ? 0
    : article
    ? MAX_WIDTH / 2 // optimised to align with article column
    : TILE_MAX_WIDTH

  return (
    <CarouselContext.Provider
      value={{
        bigger,
        outline,
        bgColor,
        color,
        tileCount,
        tileMaxWidth,
        grid
      }}
    >
      <section
        {...styles.carousel}
        style={{
          backgroundColor: bgColor,
          color: color ? color : 'inherit',
          margin: article ? '20px 0' : undefined
        }}
      >
        <div
          style={{
            margin: '0 auto',
            maxWidth: grid
              ? TILE_MAX_WIDTH * 5
              : tileCount
              ? tileCount * tileMaxWidth
              : undefined
          }}
        >
          {children}
        </div>
      </section>
    </CarouselContext.Provider>
  )
}

export default React.memo(Carousel)

Carousel.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  outline: PropTypes.string,
  bigger: PropTypes.bool,
  children: PropTypes.node
}

Carousel.defaultProps = defaultValue

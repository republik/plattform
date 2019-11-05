import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

import CarouselContext, { defaultValue } from './Context'
import { PADDING, TILE_MAX_WIDTH } from './constants'

const styles = {
  carousel: css({
    padding: `30px ${PADDING}px ${30 - PADDING}px`
  })
}

export const Carousel = ({ bgColor, color, outline, bigger, children }) => {
  const row = children && children[1]
  const nTiles = row && React.Children.count(row.props && row.props.children)

  return (
    <CarouselContext.Provider
      value={{
        bigger,
        outline,
        bgColor,
        color
      }}
    >
      <section
        {...styles.carousel}
        style={{
          backgroundColor: bgColor,
          color: color ? color : 'inherit'
        }}
      >
        <div
          style={{
            margin: '0 auto',
            maxWidth: nTiles ? nTiles * TILE_MAX_WIDTH : undefined
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

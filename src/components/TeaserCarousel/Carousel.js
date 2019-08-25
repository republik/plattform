import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

import CarouselContext, { defaultValue } from './Context'

const styles = {
  carousel: css({
    margin: 0,
    padding: '30px 15px',
    overflow: 'auto'
  })
}

export const Carousel = ({
  bgColor,
  color,
  outline,
  bigger,
  children
}) => {
  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor,
    color: color ? color : 'inherit'
  })

  return <CarouselContext.Provider value={{
    bigger,
    outline,
    bgColor,
    color
  }}>
    <section {...customStyles}>{children}</section>
  </CarouselContext.Provider>
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

import { css } from 'glamor'
import PropTypes from 'prop-types'
import React from 'react'

const styles = {
  carousel: css({
    margin: 0,
    padding: '30px 15px',
    overflow: 'auto'
  })
}

export const Carousel = ({
  bgColor = '#FFFFFF',
  color = '#000000',
  children
}) => {
  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor,
    color: color ? color : 'inherit'
  })

  return <section {...customStyles}>{children}</section>
}

export default Carousel

Carousel.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  children: PropTypes.node
}

Carousel.defaultProps = {
  bgColor: '#FFFFFF',
  color: '#000000'
}

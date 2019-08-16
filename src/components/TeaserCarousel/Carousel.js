import { css } from 'glamor'
import React from 'react'

const styles = {
  carousel: css({
    margin: 0,
    padding: '30px 15px',
    overflow: 'auto'
  })
}

export const Carousel = ({ bgColor = '#FFF', color, children }) => {
  const customStyles = css(styles.carousel, {
    backgroundColor: bgColor,
    color: color ? color : 'inherit'
  })

  return <section {...customStyles}>{children}</section>
}

export default Carousel

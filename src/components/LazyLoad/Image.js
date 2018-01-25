import React from 'react'
import { css } from 'glamor'

import LazyLoad from './'

const styles = {
  container: css({
    display: 'block',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.1)'
  }),
  img: css({
    display: 'block',
    position: 'absolute',
    width: '100%'
  })
}

export default ({src, srcSet, sizes, alt, aspectRatio, attributes, visible, offset}) => (
  <LazyLoad attributes={{...styles.container, ...attributes}} offset={offset} visible={visible} style={{
    paddingBottom: `${100 / aspectRatio}%`,
    backgroundColor: src.match(/\.png(\.webp)?(\?|$)/)
      ? 'transparent'
      : undefined
  }}>
    <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} {...styles.img} />
  </LazyLoad>
)

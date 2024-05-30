import React from 'react'
import { css } from 'glamor'

import LazyLoad from '.'

import SwitchImage from '../Figure/SwitchImage'

const styles = {
  img: css({
    display: 'block',
    position: 'relative',
    backgroundColor: 'rgba(0,0,0,0.1)',
    width: '100%',
  }),
}

const transparentExtension = /\.(png|gif|svg)(\.webp)?(\?|$)/

type LazyImageProps = {
  aspectRatio: number
} & Pick<
  React.ComponentPropsWithoutRef<typeof SwitchImage>,
  'src' | 'dark' | 'srcSet' | 'sizes' | 'alt' | 'onClick'
> &
  Pick<
    React.ComponentPropsWithoutRef<typeof LazyLoad>,
    'attributes' | 'visible' | 'offset'
  >

const LazyImage = ({
  src,
  dark,
  srcSet,
  sizes,
  alt,
  aspectRatio,
  attributes,
  visible,
  onClick,
}: LazyImageProps) => {
  return (
    <SwitchImage
      {...attributes}
      src={src}
      srcSet={srcSet}
      dark={dark}
      sizes={sizes}
      alt={alt}
      loading={visible ? 'eager' : 'lazy'}
      {...styles.img}
      style={{
        aspectRatio,
        backgroundColor:
          src.match(transparentExtension) ||
          dark?.src.match(transparentExtension)
            ? 'transparent'
            : undefined,
      }}
      onClick={onClick}
    />
  )
}

export default LazyImage

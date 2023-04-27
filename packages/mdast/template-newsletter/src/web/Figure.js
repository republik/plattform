import React from 'react'
import { css, merge } from 'glamor'

import { mq } from './styles'
import { imageResizeUrl } from 'mdast-react-render/lib/utils'

const styles = {
  image: css({
    width: '100%'
  }),
  figure: css({
    marginTop: 0,
    marginLeft: 0,
    marginRight: 0,
    marginBottom: 10
  }),
  floatLeft: css({
    [mq.medium]: {
      float: 'left',
      width: '50%',
      marginTop: 3,
      marginRight: 20
    }
  }),
  floatRight: css({
    [mq.medium]: {
      float: 'right',
      width: '50%',
      marginTop: 3,
      marginLeft: 20
    }
  })
}

export const Image = ({ src, alt, attributes = {} }) =>
  <img {...styles.image}
    src={imageResizeUrl(src, '1200x')}
    alt={alt}
    {...attributes}
  />

export const Caption = ({ children, data, attributes = {} }) => (
  <figcaption {...attributes} style={{
    textAlign: data.captionRight
      ? 'right'
      : 'left',
    fontSize: 12,
    fontFamily: 'sans-serif',
    margin: 0,
    position: 'relative'
  }}>
    {children}
  </figcaption>
)

export default ({ children, float, attributes = {} }) => {
  return (
    <figure {...merge(
    styles.figure,
    float === 'left' && styles.floatLeft,
    float === 'right' && styles.floatRight
  )} {...attributes}>
      {children}
    </figure>
  )
}

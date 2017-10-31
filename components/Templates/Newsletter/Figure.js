import React from 'react'
import { css, merge } from 'glamor'

import { mq } from './styles'
import { imageResizeUrl } from '../utils'

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

export const Image = ({ data, attributes = {} }) =>
  <img {...styles.image}
    src={imageResizeUrl(data.src, '1200x')}
    alt={data.alt}
    {...attributes}
  />

export const Caption = ({ children, data, attributes = {} }) => (
  <figcaption style={{
    textAlign: data.captionRight
      ? 'right'
      : 'left',
    fontSize: 12,
    fontFamily: 'sans-serif',
    margin: 0,
    position: 'relative'
  }} {...attributes}>
    {children}
  </figcaption>
)

export default ({ children, data, attributes = {} }) => {
  return (
    <figure {...merge(
    styles.figure,
    data.float === 'left' && styles.floatLeft,
    data.float === 'right' && styles.floatRight
  )} {...attributes}>
      {children}
    </figure>
  )
}

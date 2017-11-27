import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  image: css({
    width: '100%'
  })
}

const Image = ({ data: { src, alt }, attributes = {} }) => {
  return <img {...attributes} {...styles.image} src={src} alt={alt} />
}

Image.propTypes = {
  data: PropTypes.shape({
    src: PropTypes.string.isRequired,
    alt: PropTypes.string
  }).isRequired
}

export default Image

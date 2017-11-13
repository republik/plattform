import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  image: css({
    maxWidth: '100%'
  })
}

const Image = ({ src, alt, ...props }) => {
  return <img {...props} {...styles.image} src={src} alt={alt} />
}

Image.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string
}

export default Image

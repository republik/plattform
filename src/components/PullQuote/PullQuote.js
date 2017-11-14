import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  flex: css({
    [mUp]: {
      display: 'flex'
    }
  })
}

const SIZE = {
  narrow: 495
}

const PullQuote = ({ children, attributes, textAlign = 'inherit', size }) => {
  const margin = textAlign === 'center' ? '0 auto' : ''
  const maxWidth = (size && `${SIZE[size]}px`) || ''

  const hasFigure = [...children].some(
    c => c.props.typeName === 'PullQuoteFigure'
  )

  return (
    <blockquote
      {...attributes}
      {...(hasFigure ? styles.flex : {})}
      style={{ textAlign, maxWidth, margin }}
    >
      {children}
    </blockquote>
  )
}

PullQuote.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  textAlign: PropTypes.oneOf(['inherit', 'left', 'center', 'right']),
  size: PropTypes.oneOf(['narrow'])
}

export default PullQuote

import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp, onlyS } from '../../theme/mediaQueries'
import { Breakout } from '../Center'

export const IMAGE_SIZE = 155

const styles = {
  container: css({
    margin: '40px auto',
    [mUp]: {
      margin: '60px auto',
    },
  }),
  containerFloat: css({
    // Vertical desktop margins are currently handled in Center.
    marginLeft: 'auto',
    marginRight: 'auto',
    [onlyS]: {
      margin: '40px auto',
    },
  }),
  figure: css({
    '& figure': {
      width: IMAGE_SIZE,
    },
    [mUp]: {
      paddingLeft: 170,
      '& figure': {
        marginLeft: -170,
        marginRight: 15,
        float: 'left',
      },
    },
  }),
  clear: css({
    [mUp]: {
      clear: 'both',
    },
  }),
}

const getBreakoutSize = (size, hasFigure) => {
  if (size === 'float') {
    return hasFigure ? 'float' : 'floatTiny'
  }
  if (size === 'breakout') {
    return 'breakoutLeft'
  }
  return size
}

const PullQuote = ({ children, attributes, hasFigure, size }) => {
  const textAlign = !hasFigure && size === 'narrow' ? 'center' : 'inherit'
  const containerStyle =
    size === 'float' ? styles.containerFloat : styles.container

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, hasFigure)}>
      <blockquote
        {...containerStyle}
        {...(hasFigure ? styles.figure : {})}
        style={{ textAlign }}
      >
        {children}
        <div {...styles.clear} />
      </blockquote>
    </Breakout>
  )
}

PullQuote.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['narrow', 'float', 'breakout']),
}

export default PullQuote

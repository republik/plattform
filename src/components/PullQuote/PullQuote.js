import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Breakout } from '../Center'

const styles = {
  container: css({
    margin: '0 auto'
  }),
  figure: css({
    [mUp]: {
      paddingLeft: 170,
      '& figure': {
        marginLeft: -170,
        marginRight: 15,
        float: 'left',
        width: '155px'
      }
    }
  }),
  clear: css({
    [mUp]: {
      clear: 'both'
    }
  })
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

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, hasFigure)}>
      <blockquote
        {...styles.container}
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
  size: PropTypes.oneOf(['narrow', 'float', 'breakout'])
}

export default PullQuote

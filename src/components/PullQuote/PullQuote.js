import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { BREAKOUT_SIZE, Breakout } from '../Center'

const styles = {
  container: css({
    margin: '0 auto'
  }),
  flex: css({
    [mUp]: {
      display: 'flex'
    }
  })
}

const getBreakoutSize = (size, hasFigure) => {
  if (size === 'float') {
    return hasFigure ? BREAKOUT_SIZE.float : BREAKOUT_SIZE.floatTiny
  }
  if (size === 'breakout') {
    return BREAKOUT_SIZE.breakoutLeft
  }
  return size
}

const PullQuote = ({ children, attributes, size }) => {
  const hasFigure = [...children].some(
    c => c.props.typeName === 'PullQuoteFigure'
  )
  const textAlign = !hasFigure && size === 'narrow' ? 'center' : 'inherit'

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, hasFigure)}>
      <blockquote
        {...styles.container}
        {...(hasFigure ? styles.flex : {})}
        style={{ textAlign }}
      >
        {children}
      </blockquote>
    </Breakout>
  )
}

PullQuote.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  size: PropTypes.oneOf(['regular', 'narrow', 'float', 'breakout']).isRequired
}

PullQuote.defaultProps = {
  size: 'regular'
}

export default PullQuote

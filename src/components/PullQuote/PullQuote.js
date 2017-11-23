import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Breakout } from '../Center'
import Body from './Body'
import Figure from './Figure'

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
    return hasFigure ? 'float' : 'floatTiny'
  }
  if (size === 'breakout') {
    return 'breakoutLeft'
  }
  return size
}

const PullQuote = ({ children, attributes, size }) => {
  const childrenArray = React.Children.toArray(children)
  const figure = childrenArray.find(c => c.type === Figure)
  const textAlign = !figure && size === 'narrow' ? 'center' : 'inherit'

  return (
    <Breakout attributes={attributes} size={getBreakoutSize(size, figure)}>
      <blockquote
        {...styles.container}
        {...(figure ? styles.flex : {})}
        style={{ textAlign }}
      >
        {figure}
        <Body>
          {childrenArray.filter(c => c !== figure)}
        </Body>
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

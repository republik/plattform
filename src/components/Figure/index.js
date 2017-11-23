import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { Breakout } from '../Center'

const styles = {
  figure: css({
    margin: '0 0 15px 0',
    padding: 0
  }),
  figureGroup: css({
    margin: 0,
    display: 'block',
    [mUp]: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }
  }),
  col2: css({
    [mUp]: {
      maxWidth: `calc(${100 / 2}% - 8px)`
    }
  }),
  col3: css({
    [mUp]: {
      maxWidth: `calc(${100 / 3}% - 10px)`
    }
  }),
  col4: css({
    [mUp]: {
      maxWidth: `calc(${100 / 4}% - 12px)`
    }
  })
}

export const Figure = ({ children, attributes, size }) => (
  <Breakout size={size} attributes={attributes}>
    <figure {...styles.figure}>
      {children}
    </figure>
  </Breakout>
)

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export const FigureGroup = ({ children, attributes, columns, size, data }) => {
  return (
    <Breakout size={size} attributes={attributes}>
      <figure
        role='group'
        {...styles.figureGroup}
      >
        {React.Children.map(children, child => {
          if (child.type === Figure && columns > 1) {
            return <div key={child.key} {...styles[`col${columns}`]}>{child}</div>
          }
          return child
        })}
      </figure>
    </Breakout>
  )
}

FigureGroup.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  columns: PropTypes.oneOf([2, 3, 4]).isRequired
}

FigureGroup.defaultProps = {
  columns: 2
}


import React from 'react'
import PropTypes from 'prop-types'
import { css, merge } from 'glamor'
import { mUp } from '../../theme/mediaQueries'
import { breakoutStyles } from '../Center'

const styles = {
  figure: css({
    margin: 0,
    marginBottom: 15,
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
      '& figure': {
        maxWidth: `calc(${100 / 2}% - 8px)`
      }
    }
  }),
  col3: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 3}% - 10px)`
      }
    }
  }),
  col4: css({
    [mUp]: {
      '& figure': {
        maxWidth: `calc(${100 / 4}% - 12px)`
      }
    }
  })
}

export const Figure = ({ children, attributes, size }) => (
  <figure {...attributes} {...merge(styles.figure, breakoutStyles[size])}>
    {children}
  </figure>
)

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export const FigureGroup = ({ children, attributes, columns, size, data }) => {
  return (
    <figure
      role='group'
      {...attributes}
      {...merge(styles.figureGroup, breakoutStyles[size])}
      {...styles[`col${columns}`]}
    >
      {children}
    </figure>
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


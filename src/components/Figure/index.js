import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  figure: css({
    margin: '0 0 15px 0',
    padding: 0,
    '[data-columns="2"] > &': {
      [mUp]: {
        maxWidth: `calc(${100 / 2}% - 8px)`
      }
    },
    '[data-columns="3"] > &': {
      [mUp]: {
        maxWidth: `calc(${100 / 3}% - 10px)`
      }
    },
    '[data-columns="4"] > &': {
      [mUp]: {
        maxWidth: `calc(${100 / 4}% - 12px)`
      }
    },
    '[role="group"] > &:first-child': {
      marginLeft: 0
    },
    '[role="group"] > &:last-child': {
      marginRight: 0
    },
    '[role="group"] > &:last-of-type': {
      marginRight: 0
    }
  }),
  figureGroup: css({
    display: 'block',
    [mUp]: {
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'space-between'
    }
  })
}

export const Figure = ({ children, attributes }) => {
  return (
    <figure {...attributes} {...styles.figure}>
      {children}
    </figure>
  )
}

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  typeName: PropTypes.string
}

Figure.defaultProps = {
  typeName: 'Figure'
}

export const FigureGroup = ({ children, attributes, data }) => {
  const columns =
    (data && data.columns) ||
    children.filter(c => c.props.typeName === 'Figure').length
  return (
    <figure
      role={'group'}
      {...attributes}
      {...styles.figureGroup}
      data-columns={columns}
    >
      {children}
    </figure>
  )
}

FigureGroup.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  data: PropTypes.object
}

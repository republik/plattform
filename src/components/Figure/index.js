import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { mUp } from '../../theme/mediaQueries'

const styles = {
  figure: css({
    margin: '0 0 15px 0',
    padding: 0,
    '&[role=group]': {
      display: 'block',
      [mUp]: {
        display: 'flex',
        flexWrap: 'wrap'
      }
    },
    '[role="group"] > &': {
      [mUp]: {
        margin: '0 7.5px'
      }
    },
    '[data-siblings="2"] > &': {
      [mUp]: {
        maxWidth: `calc(${100 / 2}% - 8px)`
      }
    },
    '[data-siblings="3"] > &': {
      [mUp]: {
        maxWidth: `calc(${100 / 3}% - 10px)`
      }
    },
    '[data-siblings="4"] > &': {
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
  })
}

export const Figure = ({ children, attributes, role, ...props }) => {
  return (
    <figure {...attributes} {...props} {...styles.figure} role={role}>
      {children}
    </figure>
  )
}

Figure.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  role: PropTypes.string,
  type: PropTypes.string
}

Figure.defaultProps = {
  type: 'Figure'
}

export const FigureGroup = ({ children, attributes, ...props }) => {
  const numSiblings = children.filter(c => c.props.type === 'Figure').length
  return (
    <Figure
      {...attributes}
      {...props}
      {...styles.figure}
      role={'group'}
      data-siblings={numSiblings}
    >
      {children}
    </Figure>
  )
}

FigureGroup.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

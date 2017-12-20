import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'
import { dUp } from '../TeaserFront/mediaQueries'

const styles = {
  container: css({
    backgroundColor: '#f5f5f5',
    position: 'relative',
    lineHeight: 0,
    margin: 0,
    padding: '60px 0 40px 0',
    [dUp]: {
      background: 'none'
    }
  }),
  textContainer: css({
    padding: '15px',
    [dUp]: {
      padding: 0
    }
  })
}

const Teaser = ({ children, attributes, onClick }) => {
  return (
    <div
      {...attributes}
      {...styles.container}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default'
      }}
    >
      <div {...styles.textContainer}>{children}</div>
    </div>
  )
}

Teaser.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object,
  onClick: PropTypes.func
}

Teaser.defaultProps = {}

export default Teaser

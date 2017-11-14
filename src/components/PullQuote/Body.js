import React from 'react'
import PropTypes from 'prop-types'
import { css } from 'glamor'

const styles = {
  body: css({
    flex: 1
  })
}

export const Body = ({ children, attributes }) => {
  return (
    <div {...attributes} {...styles.body}>
      {children}
    </div>
  )
}

Body.propTypes = {
  children: PropTypes.node.isRequired,
  attributes: PropTypes.object
}

export default Body

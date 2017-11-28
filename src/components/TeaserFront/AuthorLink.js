import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'

// TODO: Support custom color for hover state.
const AuthorLink = ({ children }) => {
  return (
    <Editorial.AuthorLink style={{ color: 'inherit' }}>
      {children}
    </Editorial.AuthorLink>
  )
}

AuthorLink.propTypes = {
  children: PropTypes.node.isRequired
}

export default AuthorLink

import PropTypes from 'prop-types'
import React from 'react'

const Lead = ({ children }) => {
  return <span>{children}</span>
}

Lead.propTypes = {
  children: PropTypes.node
}

export default Lead

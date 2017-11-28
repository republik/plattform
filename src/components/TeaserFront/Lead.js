import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'

const Lead = ({ children }) => {
  return <Editorial.Lead style={{color: 'inherit'}}>{children}</Editorial.Lead>
}

Lead.propTypes = {
  children: PropTypes.node.isRequired
}

export default Lead

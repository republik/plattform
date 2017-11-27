import React from 'react'
import PropTypes from 'prop-types'
import { Editorial } from '../Typography'

const Credit = ({ children }) => {
  return <Editorial.Credit style={{color: 'inherit'}}>{children}</Editorial.Credit>
}

Credit.propTypes = {
  children: PropTypes.node.isRequired
}

export default Credit

import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import NativeDropdown from './NativeDropdown'
import VirtualDropdown from './VirtualDropdown'

const getUseNative = () =>
  typeof navigator === 'undefined' ||
  /iPad|iPhone|iPod|android/i.test(navigator.userAgent)

let defaultUseNative = true

const Dropdown = props => {
  const [useNative, setUseNative] = useState(defaultUseNative)
  useEffect(() => {
    defaultUseNative = getUseNative()
    setUseNative(defaultUseNative)
  }, [])
  return useNative ? (
    <NativeDropdown {...props} />
  ) : (
    <VirtualDropdown {...props} />
  )
}

Dropdown.Native = NativeDropdown
Dropdown.Virtual = VirtualDropdown

Dropdown.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    element: PropTypes.node
  }).isRequired).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func
}

export default Dropdown

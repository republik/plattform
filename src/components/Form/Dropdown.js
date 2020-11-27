import React, { useState, useEffect } from 'react'
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

export default Dropdown

import React from 'react'
import NativeDropdown from './NativeDropdown'
import VirtualDropdown from './VirtualDropdown'

const useNative = typeof navigator === 'undefined'
  || /iPad|iPhone|iPod|android/i.test(navigator.userAgent)

const Dropdown = props => useNative
  ? <NativeDropdown {...props} />
  : <VirtualDropdown {...props} />

Dropdown.Native = NativeDropdown
Dropdown.Virtual = VirtualDropdown

export default Dropdown

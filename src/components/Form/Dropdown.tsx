import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

import NativeDropdown from './NativeDropdown'
import VirtualDropdown from './VirtualDropdown'

const getUseNative = () =>
  typeof navigator === 'undefined' ||
  /iPad|iPhone|iPod|android/i.test(navigator.userAgent)

let defaultUseNative = true

const Dropdown = (props: DropdownProps) => {
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

type ItemType = {
  value: string
  text: string
  element?: React.ReactNode
}

export type DropdownProps = {
  label?: string
  items: ItemType[]
  value?: string
  onChange?: (item: ItemType) => void
}

export default Dropdown

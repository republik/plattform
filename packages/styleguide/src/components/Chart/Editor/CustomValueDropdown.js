import React from 'react'
import Dropdown from '../../Form/Dropdown'

const CustomValueDropdown = ({ value, items, ...props }) => {
  const itemsHasValue = items.find((item) => item.value === value)
  const itemsWithValue = itemsHasValue
    ? items
    : items.concat({
        value,
        text: `Spezial: ${value}`,
      })

  return <Dropdown items={itemsWithValue} value={value} {...props} />
}

export default CustomValueDropdown

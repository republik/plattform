import React, { useState } from 'react'
import { Label } from './DropdownLabel'
import { DropdownProps } from './Dropdown'

const NativeDropdown = (props: DropdownProps) => {
  const { label, items, value, onChange } = props
  const [focus, setFocus] = useState(false)
  const selectedItem = items.find((item) => item.value === value)

  return (
    <Label top={!!selectedItem || focus} focus={focus} text={label}>
      {/* ensure the height for selected multiline values (<Inner> is absolute) */}
      <Label Element='span' field>
        {selectedItem ? selectedItem.element || selectedItem.text : ''}
      </Label>
      <Label
        Element='select'
        field
        value={value}
        onChange={
          onChange &&
          ((e) => onChange(items.find((item) => item.value === e.target.value)))
        }
        onFocus={() => {
          setFocus(true)
        }}
        onBlur={() => {
          setFocus(false)
        }}
      >
        {items.map((item, index) => (
          <option key={index} value={item.value}>
            {item.text}
          </option>
        ))}
      </Label>
    </Label>
  )
}

export default React.memo(NativeDropdown)

import React, { useState, useEffect } from 'react'

import Dropdown from '../../Form/Dropdown'
import { deduplicate } from '../utils'

export const ColorField = props => {
  const {
    label,
    items,
    createOnDropdownChange,
    property,
    value,
    chartData,
    colorColumn,
    customColorDropdownItems,
    createColorMapChange
  } = props

  const [customColorMap, setCustomColorMap] = useState({})
  const [customColorFields, setCustomColorFields] = useState()

  console.log(customColorMap)

  const handleColorChange = key => item => {
    return setCustomColorMap({ ...customColorMap, [key]: item.value })
  }

  useEffect(() => {
    setCustomColorFields(chartData.map(d => d[colorColumn]).filter(deduplicate))
  }, [colorColumn])

  useEffect(() => {
    value === 'custom_color' && createColorMapChange(customColorMap)
  }, [customColorMap])

  useEffect(() => {
    value === 'party_colors' && createColorMapChange('swissPartyColors')
  }, [value])

  return (
    <>
      <Dropdown
        label={label}
        items={items}
        value={value}
        onChange={createOnDropdownChange(property)}
      />
      {value === 'custom_color' &&
        colorColumn &&
        customColorFields.map(colorField => {
          return (
            <div
              style={{ display: 'flex', alignItems: 'center' }}
              key={colorField}
            >
              <div style={{ flexBasis: '50%' }}>{colorField}</div>
              <div style={{ flexBasis: '50%' }}>
                <Dropdown
                  label={''}
                  items={customColorDropdownItems}
                  value={customColorMap[colorField]}
                  onChange={handleColorChange(colorField)}
                />
              </div>
            </div>
          )
        })}
      {value === 'custom_color' && !colorColumn && (
        <span>Wähle noch eine Spalte für die Farbe aus.</span>
      )}
    </>
  )
}

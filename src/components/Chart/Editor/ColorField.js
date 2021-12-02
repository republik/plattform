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
    createColorMapChange,
    colorMap
  } = props

  const [customColorMap, setCustomColorMap] = useState(colorMap || {})
  const [customColorFields, setCustomColorFields] = useState('')

  const handleColorChange = key => item => {
    return setCustomColorMap({ ...customColorMap, [key]: item.value })
  }

  // const handleColorPickerChange = key => item => {
  //   return setCustomColorMap({ ...customColorMap, [key]: item.target.value })
  // }

  useEffect(() => {
    setCustomColorFields(chartData.map(d => d[colorColumn]).filter(deduplicate))
  }, [colorColumn, chartData])

  useEffect(() => {
    value === 'custom_color'
      ? createColorMapChange(customColorMap)
      : value === 'party_colors'
      ? createColorMapChange('swissPartyColors')
      : createColorMapChange()
  }, [value, customColorMap])

  return (
    <>
      {value === 'custom_color' && !colorColumn && (
        <span>Wähle noch eine Spalte für die Farbe aus.</span>
      )}
      <div style={{ marginBottom: '30px' }}>
        <Dropdown
          label={label}
          items={items}
          value={value}
          onChange={createOnDropdownChange(property)}
        />
      </div>
      {value === 'custom_color' &&
        colorColumn &&
        customColorFields &&
        customColorFields.map(colorField => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center'
              }}
              key={colorField}
            >
              <div style={{ flexBasis: '60%' }}>{colorField}</div>
              <div style={{ flexBasis: '39%' }}>
                <Dropdown
                  label={''}
                  items={customColorDropdownItems}
                  value={customColorMap[colorField] || ''}
                  onChange={handleColorChange(colorField)}
                />
              </div>
              {/* <div style={{ flexBasis: '24%' }}>
                <input
                  type='color'
                  value={customColorMap[colorField] || '#2077b4'}
                  onChange={handleColorPickerChange(colorField)}
                />
              </div> */}
            </div>
          )
        })}
    </>
  )
}

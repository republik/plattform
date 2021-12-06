import React, { useState, useEffect } from 'react'
import { BlockPicker as ColorPicker } from 'react-color'

import Dropdown from '../../Form/Dropdown'
import { deduplicate } from '../utils'
import CalloutMenu from '../../Callout/CalloutMenu'

export const ColorField = props => {
  const {
    label,
    items,
    createOnDropdownChange,
    property,
    value,
    chartData,
    colorColumn,
    createColorMapChange,
    colorMap,
    customColors
  } = props

  const [customColorMap, setCustomColorMap] = useState(colorMap || '')
  const [customColorFields, setCustomColorFields] = useState('')

  const handleColorPickerChange = key => item => {
    setCustomColorMap({ ...customColorMap, [key]: item.hex })
  }

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
                alignItems: 'center',
                padding: '5px 0'
              }}
              key={colorField}
            >
              <div style={{ flexBasis: '60%' }}>{colorField}</div>
              <div
                style={{
                  flexBasis: '39%',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <CalloutMenu
                  Element={props => (
                    <div
                      style={{
                        backgroundColor:
                          customColorMap[colorField] || '#2077b4',
                        width: '40px',
                        height: '20px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                      {...props}
                    />
                  )}
                  align='right'
                >
                  <ColorPicker
                    triangle='hide'
                    colors={customColors}
                    color={customColorMap[colorField] || '#2077b4'}
                    onChange={handleColorPickerChange(colorField)}
                  />
                </CalloutMenu>
              </div>
            </div>
          )
        })}
    </>
  )
}

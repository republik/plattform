import React, { useState, useEffect } from 'react'
import { BlockPicker as ColorPicker } from 'react-color'

import Dropdown from '../../Form/Dropdown'
import { deduplicate } from '../utils'
import CalloutMenu from '../../Callout/CalloutMenu'

export const ColorField = props => {
  const {
    label,
    items,
    createOnColorChange,
    chartData,
    colorColumn,
    colorMap,
    customColors,
    colorRange = '',
    colorRanges
  } = props

  const [value, setValue] = useState(colorMap ? 'custom_color' : colorRange)
  const [customColorMap, setCustomColorMap] = useState(colorMap || '')
  const [customColorFields, setCustomColorFields] = useState([])

  const handleColorPickerChange = key => item => {
    setCustomColorMap({ ...customColorMap, [key]: item.hex })
  }

  // set colorMap or colorRange depending on user input
  useEffect(() => {
    if (value === 'custom_color') {
      createOnColorChange('colorMap')(customColorMap)
    } else if (value === 'party_color') {
      createOnColorChange('colorMap')('swissPartyColors')
    } else {
      createOnColorChange('colorRange')(value)
    }
  }, [value, customColorMap])

  // get color fields from data
  useEffect(() => {
    setCustomColorFields(chartData.map(d => d[colorColumn]).filter(deduplicate))
  }, [colorColumn, chartData])

  // default color setup for colorMap if no colorMap exists
  useEffect(() => {
    let tempColorMap = {}
    customColorFields.map(
      (colorField, index) =>
        (tempColorMap = {
          ...tempColorMap,
          [colorField]: colorRange
            ? colorRanges[colorRange][index]
            : customColors[index]
        })
    )
    console.log(tempColorMap)
    !colorMap && setCustomColorMap(tempColorMap)
  }, [customColorFields, colorRange])

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
          onChange={item => setValue(item.value)}
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
                          customColorMap[colorField] || '#e0e0e0',
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
                    color={customColorMap[colorField] || '#e0e0e0'}
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

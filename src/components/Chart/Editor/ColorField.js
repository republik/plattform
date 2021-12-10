import React, { useState, useEffect } from 'react'
import { BlockPicker as ColorPicker } from 'react-color'

import Dropdown from '../../Form/Dropdown'
import { deduplicate } from '../utils'
import CalloutMenu from '../../Callout/CalloutMenu'
import { ColorDropdownElement } from './ColorDropdownElement'

import { colorMaps } from '../colorMaps'

export const ColorField = props => {
  const {
    label,
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

  const colorValues = chartData.map(d => d[colorColumn]).filter(deduplicate)
  const items = []
    .concat(
      { value: '', text: 'automatisch' },
      { value: 'custom_color', text: 'Farben einzeln zuweisen' },
    )
    .concat(
      Object.keys(colorRanges).map((d, i) => {
        return {
          value: d,
          text: d,
          element: (
            <ColorDropdownElement
              key={'colorRange' + i}
              colorRange={colorRanges[d]}
              name={d}
            />
          )
        }
      })
    )
    .concat(
      Object.keys(colorMaps).map((d, i) => {
        return {
          value: d,
          text: d,
          element: (
            <ColorDropdownElement
              key={'colorMap' + i}
              colorRange={Object.values(colorMaps[d]).filter(deduplicate)}
              name={d}
            />
          )
        }
      })
    )

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
        colorValues.map(colorValue => {
          return (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '5px 0'
              }}
              key={colorValue}
            >
              <div style={{ flexBasis: '60%' }}>{colorValue}</div>
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
                          customColorMap[colorValue] || '#e0e0e0',
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
                    color={customColorMap[colorValue] || '#e0e0e0'}
                    onChange={handleColorPickerChange(colorValue)}
                  />
                </CalloutMenu>
              </div>
            </div>
          )
        })}
    </>
  )
}

import React, { useMemo } from 'react'
import { BlockPicker as ColorPicker } from 'react-color'

import Dropdown from '../../Form/Dropdown'
import { deduplicate, runSort } from '../utils'
import CalloutMenu from '../../Callout/CalloutMenu'
import { ColorDropdownElement } from './ColorDropdownElement'
import { useColorContext } from '../../Colors/ColorContext'
import { createRanges } from '..'
import { colorMaps, CHART_DEFAULT_FILL } from '../colorMaps'

const TYPES_WITH_COLOR_SORT = ['Bar', 'Lollipop', 'ScatterPlot']

export const ColorField = props => {
  const {
    label,
    onFieldsChange,
    chartData,
    colorColumn,
    config,
    colorMap,
    colorRange
  } = props

  const [colorScheme] = useColorContext()
  const colorRanges = useMemo(() => createRanges(colorScheme.ranges), [
    colorScheme
  ])

  const items = []
    .concat(
      { value: '_auto', text: 'automatisch' },
      { value: '_custom', text: 'Farben einzeln zuweisen' }
    )
    .concat(
      Object.keys(colorRanges).map((d, i) => {
        return {
          value: d,
          predefined: 'colorRange',
          text: d,
          element: (
            <ColorDropdownElement
              key={'colorRange' + i}
              colorRange={colorRanges[d]}
              name={`range ${d}`}
            />
          )
        }
      })
    )
    .concat(
      Object.keys(colorMaps).map((d, i) => {
        return {
          value: d,
          predefined: 'colorMap',
          text: d,
          element: (
            <ColorDropdownElement
              key={'colorMap' + i}
              colorRange={Object.values(colorMaps[d]).filter(deduplicate)}
              name={`map ${d}`}
            />
          )
        }
      })
    )

  const value = colorMaps[colorMap]
    ? colorMap
    : colorRanges[colorRange]
    ? colorRange
    : !colorMap && !colorRange
    ? '_auto'
    : '_custom'

  const colorValues = chartData
    .map(d => d[colorColumn])
    .concat(config.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)
  if (TYPES_WITH_COLOR_SORT.includes(config.type)) {
    runSort(config.colorSort, colorValues)
  }
  if (colorMap) {
    Object.keys(colorMap).forEach(colorValue => {
      if (!colorValues.includes(colorValue)) {
        colorValues.push(colorValue)
      }
    })
  }
  if (colorValues.length === 0) {
    colorValues.push('')
  }
  const computedColorMap = {
    ...colorMap
  }
  const colorRangeArray = colorRanges[colorRange] || colorRange
  if (Array.isArray(colorRangeArray)) {
    colorValues.forEach((colorValue, index) => {
      if (computedColorMap[colorValue] === undefined) {
        computedColorMap[colorValue] = colorRangeArray[index]
      }
    })
  }

  const setColorMap = newColorMap => {
    const keys = Object.keys(newColorMap)
    if (keys.length === 1 && !keys[0]) {
      onFieldsChange({
        colorMap: undefined,
        colorRange: [newColorMap[keys[0]] || CHART_DEFAULT_FILL]
      })
    } else {
      onFieldsChange({
        colorMap: newColorMap,
        colorRange: undefined
      })
    }
  }
  const handleDropdownChange = item => {
    if (item.predefined) {
      onFieldsChange({
        colorMap: undefined,
        colorRange: undefined,
        [item.predefined]: item.value
      })
    } else if (item.value === '_auto') {
      onFieldsChange({
        colorMap: undefined,
        colorRange: undefined
      })
    } else {
      setColorMap(computedColorMap)
    }
  }
  const createColorPickerOnChange = key => item => {
    setColorMap({ ...computedColorMap, [key]: item.hex })
  }
  const pickableColors = colorRanges.discrete

  return (
    <>
      <div style={{ marginBottom: '30px' }}>
        <Dropdown
          label={label}
          items={items}
          value={value}
          onChange={handleDropdownChange}
        />
      </div>
      {value === '_custom' &&
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
              <div style={{ flexBasis: '60%' }}>{colorValue || 'Alle'}</div>
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
                          computedColorMap[colorValue] || CHART_DEFAULT_FILL,
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
                    colors={pickableColors}
                    color={computedColorMap[colorValue] || CHART_DEFAULT_FILL}
                    onChange={createColorPickerOnChange(colorValue)}
                  />
                </CalloutMenu>
              </div>
            </div>
          )
        })}
    </>
  )
}

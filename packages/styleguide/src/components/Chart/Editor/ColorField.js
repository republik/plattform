import React, { useMemo } from 'react'

import Dropdown from '../../Form/Dropdown'
import { deduplicate, runSort } from '../utils'
import { ColorDropdownElement } from './ColorDropdownElement'
import {
  ColorContextProvider,
  useColorContext,
} from '../../Colors/ColorContext'
import { createRanges } from '..'
import { colorMaps, CHART_DEFAULT_FILL } from '../colorMaps'
import { plainButtonRule } from '../../Button'
import omit from 'lodash/omit'
import Checkbox from '../../Form/Checkbox'
import ColorPickerCallout from './ColorPickerCallout'
import Field from '../../Form/Field'
import { IconClose } from '@republik/icons'

const TYPES_WITH_COLOR_SORT = ['Bar', 'Lollipop', 'ScatterPlot']

export const ColorField = (props) => {
  const {
    label,
    onFieldsChange,
    chartData,
    colorColumn,
    config,
    colorMap,
    colorRange,
  } = props

  const [colorScheme] = useColorContext()
  const colorRanges = useMemo(
    () => createRanges(colorScheme.ranges),
    [colorScheme],
  )

  const items = []
    .concat(
      { value: '_auto', text: 'automatisch' },
      { value: '_custom', text: 'Farben einzeln zuweisen' },
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
          ),
        }
      }),
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
          ),
        }
      }),
    )

  const value = colorMaps[colorMap]
    ? colorMap
    : colorRanges[colorRange]
    ? colorRange
    : !colorMap && !colorRange
    ? '_auto'
    : '_custom'

  const colorValues = chartData
    .map((d) => d[colorColumn])
    .concat(config.colorLegendValues)
    .filter(Boolean)
    .filter(deduplicate)

  if (TYPES_WITH_COLOR_SORT.includes(config.type)) {
    runSort(config.colorSort, colorValues)
  }
  if (colorMap) {
    Object.keys(colorMap).forEach((colorValue) => {
      if (!colorValues.includes(colorValue)) {
        colorValues.push(colorValue)
      }
    })
  }
  if (colorValues.length === 0) {
    colorValues.push('')
  }
  const computedColorMap = {
    ...colorMap,
  }
  const colorRangeArray = colorRanges[colorRange] || colorRange
  if (Array.isArray(colorRangeArray)) {
    colorValues.forEach((colorValue, index) => {
      if (computedColorMap[colorValue] === undefined) {
        computedColorMap[colorValue] = colorRangeArray[index]
      }
    })
  }

  const setColorMap = (
    newColorMap,
    newColorDarkMapping = config.colorDarkMapping,
  ) => {
    const keys = Object.keys(newColorMap)
    const colorDarkMapping = newColorDarkMapping
      ? newColorDarkMapping
      : undefined
    if (keys.length === 1 && !keys[0]) {
      onFieldsChange({
        colorMap: undefined,
        colorRange: [newColorMap[keys[0]] || CHART_DEFAULT_FILL],
        colorDarkMapping,
      })
    } else {
      onFieldsChange({
        colorMap: newColorMap,
        colorRange: undefined,
        colorDarkMapping,
      })
    }
  }
  const handleDropdownChange = (item) => {
    if (item.predefined) {
      onFieldsChange({
        colorMap: undefined,
        colorRange: undefined,
        [item.predefined]: item.value,
      })
    } else if (item.value === '_auto') {
      onFieldsChange({
        colorMap: undefined,
        colorRange: undefined,
      })
    } else {
      setColorMap(computedColorMap)
    }
  }
  const createColorPickerOnChange = (key, oldColor) => (item) => {
    setColorMap(
      { ...computedColorMap, [key]: item.hex },
      config.colorDarkMapping && omit(config.colorDarkMapping, oldColor),
    )
  }
  const createColorPickerOnChangeDark = (color) => (item) => {
    onFieldsChange({
      colorDarkMapping: {
        ...config.colorDarkMapping,
        [color]: item.hex,
      },
    })
  }
  const pickableColors = colorRanges.discrete
  const hasDarkModeColors = !!config.colorDarkMapping

  return (
    <>
      <div style={{ marginBottom: '15px' }}>
        {config.thresholds ? (
          <Field label={label} value='Spezial: Schwellenwerte' disabled />
        ) : (
          <Dropdown
            label={label}
            items={items}
            value={value}
            onChange={handleDropdownChange}
          />
        )}
      </div>
      {value === '_custom' && !config.thresholds && (
        <>
          {colorValues.map((colorValue) => {
            const color = computedColorMap[colorValue]
            const colorDark = config.colorDarkMapping?.[color]

            return (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
                key={colorValue}
              >
                <div style={{ flexGrow: 1 }}>{colorValue || 'Alle'}</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                  }}
                >
                  {color && (
                    <button
                      {...plainButtonRule}
                      style={{
                        verticalAlign: 'middle',
                        padding: 2,
                        lineHeight: 0,
                      }}
                      onClick={() => {
                        setColorMap(
                          omit(computedColorMap, colorValue),
                          config.colorDarkMapping &&
                            omit(config.colorDarkMapping, color),
                        )
                      }}
                    >
                      <IconClose size={16} />
                    </button>
                  )}
                  <ColorPickerCallout
                    mode={hasDarkModeColors ? 'light' : undefined}
                    pickableColors={pickableColors}
                    color={color || CHART_DEFAULT_FILL}
                    onChange={createColorPickerOnChange(colorValue, color)}
                  />
                  {hasDarkModeColors && (
                    <ColorContextProvider colorSchemeKey='dark'>
                      <ColorPickerCallout
                        mode='dark'
                        pickableColors={pickableColors}
                        color={colorDark || color || CHART_DEFAULT_FILL}
                        onChange={
                          color
                            ? createColorPickerOnChangeDark(color)
                            : createColorPickerOnChange(colorValue, color)
                        }
                      />
                    </ColorContextProvider>
                  )}
                </div>
              </div>
            )
          })}
          <div style={{ marginTop: 15 }}>
            <Checkbox
              checked={hasDarkModeColors}
              onChange={(_, checked) => {
                onFieldsChange({
                  colorDarkMapping: checked ? {} : undefined,
                })
              }}
            >
              Farben für den Nachtmodus anpassen
            </Checkbox>
          </div>
        </>
      )}
    </>
  )
}

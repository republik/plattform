import React, { useMemo } from 'react'
import { csvParse } from 'd3-dsv'

import Dropdown from '../../Form/Dropdown'
import { FormFields } from './FormFields'
import { ColorDropdownElement } from './ColorDropdownElement'

import { useColorContext } from '../../Colors/ColorContext'

import { timeParse } from '../../../lib/timeFormat'
import { getFormat } from '../utils'
import { defaultProps } from '../ChartContext'
import { lineEditorSchema } from '../Lines'
import { timeBarEditorSchema } from '../TimeBars'
import {
  numberFormats,
  timeFormats,
  xScaleTypes,
  yScaleTypes,
  sortingOptions,
  timeParsing
} from './Editor.utils'
import { barEditorSchema, lollipopEditorSchema } from '../Bars'
import { scatterPlotEditorSchema } from '../ScatterPlots'

const schemaDict = {
  Line: lineEditorSchema,
  TimeBar: timeBarEditorSchema,
  Lollipop: lollipopEditorSchema,
  Bar: barEditorSchema,
  ScatterPlot: scatterPlotEditorSchema
}

const chartTypes = Object.keys(schemaDict).map(d => {
  return { value: d, text: d }
})

const ChartEditor = ({ data, value, onChange, activeTab }) => {
  const [colorScheme] = useColorContext()
  const chartData = useMemo(() => csvParse(data), [data])

  const createRanges = ({ sequential, sequential3, opposite3, discrete }) => {
    const oppositeReversed = [].concat(opposite3).reverse()
    return {
      diverging1: [sequential3[1], opposite3[1]],
      diverging2: [...sequential3.slice(0, 2), ...oppositeReversed.slice(0, 2)],
      diverging3: [...sequential3, ...oppositeReversed],
      sequential3,
      sequential: sequential,
      discrete
    }
  }

  const colorRanges = useMemo(() => createRanges(colorScheme.ranges), [
    colorScheme
  ])

  const customColors = [...colorRanges.discrete]

  const colorRangesArray = Object.keys(colorRanges)

  const colorDropdownItems = colorRangesArray
    .map((d, i) => {
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
    .concat(
      { value: '', text: 'automatisch' },
      { value: 'custom_color', text: 'Farben einzeln zuweisen' },
      { value: 'party_colors', text: 'Parteifarben' }
    )

  const columns = Object.keys(chartData[0]).map(d => {
    return { value: d, text: d }
  })

  const createOnColorChange = key => colorValue => {
    const newValue = value
    delete newValue[key === 'colorMap' ? 'colorRange' : 'colorMap']
    onChange({ ...newValue, [key]: colorValue })
  }

  const createOnFieldChange = key => {
    return (_, newValue) => {
      onChange({ ...value, [key]: newValue })
    }
  }

  const createOnNumberFieldChange = key => {
    return (_, newValue) => {
      onChange({ ...value, [key]: Number(newValue) })
    }
  }

  const createOnDropdownChange = key => item => {
    return onChange({ ...value, [key]: item.value })
  }

  const timeFormatParser = timeParse(
    value.timeParse || value.timeFormat || '%Y'
  )

  const createSchema = type => {
    return schemaDict[type]({
      fields: columns,
      defaults: defaultProps[type],
      numberFormats,
      xScaleTypes,
      yScaleTypes,
      timeFormats,
      colorDropdownItems,
      sortingOptions,
      timeParsing
    })
  }

  const schema = createSchema(value.type)

  return (
    <div>
      <Dropdown
        label='Charttyp auswählen'
        items={chartTypes}
        value={value.type}
        onChange={createOnDropdownChange('type')}
      />

      <FormFields
        createOnFieldChange={createOnFieldChange}
        createOnDropdownChange={createOnDropdownChange}
        createOnNumberFieldChange={createOnNumberFieldChange}
        createOnColorChange={createOnColorChange}
        timeFormatParser={timeFormatParser}
        value={value}
        fields={
          activeTab === 'basic'
            ? schema.properties.basic
            : schema.properties.advanced
        }
        chartData={chartData}
        customColors={customColors}
      />
    </div>
  )
}

export default ChartEditor

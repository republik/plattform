import React, { useMemo } from 'react'
import { csvParse } from 'd3-dsv'

import Dropdown from '../../Form/Dropdown'
import { FormFields } from './FormFields'

import { defaultProps } from '../ChartContext'
import { slopeEditorSchema, lineEditorSchema } from '../Lines'
import { timeBarEditorSchema } from '../TimeBars'
import { barEditorSchema, lollipopEditorSchema } from '../Bars'
import { scatterPlotEditorSchema } from '../ScatterPlots'
import {
  genericMapEditorSchema,
  projectedMapEditorSchema,
  swissMapEditorSchema
} from '../Maps'
import { hemicycleEditorSchema } from '../Hemicycle'
import {
  numberFormats,
  timeFormats,
  xScaleTypes,
  yScaleTypes,
  sortingOptions,
  timeParsing
} from './Editor.utils'

const schemaDict = {
  Line: lineEditorSchema,
  TimeBar: timeBarEditorSchema,
  Lollipop: lollipopEditorSchema,
  Bar: barEditorSchema,
  ScatterPlot: scatterPlotEditorSchema,
  Slope: slopeEditorSchema,
  GenericMap: genericMapEditorSchema,
  ProjectedMap: projectedMapEditorSchema,
  SwissMap: swissMapEditorSchema,
  Hemicycle: hemicycleEditorSchema
}

const chartTypes = Object.keys(schemaDict)
  .map(d => {
    return { value: d, text: d }
  })
  .slice(0, 6)

const ChartEditor = ({ data, value, onChange, activeTab }) => {
  const chartData = useMemo(() => csvParse(data), [data])

  if (!chartData?.columns) {
    return
  }

  const columns = chartData.columns.map(d => {
    return { value: d, text: d }
  })

  const onFieldsChange = newValues => {
    onChange({ ...value, ...newValues })
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
    return onChange({ ...value, [key]: item.value || undefined })
  }

  const createSchema = (type = 'Line') => {
    return schemaDict[type]({
      fields: columns,
      defaults: defaultProps[type],
      numberFormats,
      xScaleTypes,
      yScaleTypes,
      timeFormats,
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
        onFieldsChange={onFieldsChange}
        createOnFieldChange={createOnFieldChange}
        createOnDropdownChange={createOnDropdownChange}
        createOnNumberFieldChange={createOnNumberFieldChange}
        value={value}
        fields={
          activeTab === 'basic'
            ? schema.properties.basic
            : schema.properties.advanced
        }
        chartData={chartData}
      />
    </div>
  )
}

export default ChartEditor

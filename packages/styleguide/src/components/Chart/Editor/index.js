import React, { useMemo } from 'react'
import { csvParse } from 'd3-dsv'

import CustomValueDropdown from './CustomValueDropdown'
import { FormFields } from './FormFields'

import { defaultProps } from '../ChartContext'
import { slopeEditorSchema, lineEditorSchema } from '../Lines.schema'
import { timeBarEditorSchema } from '../TimeBars.schema'
import { barEditorSchema, lollipopEditorSchema } from '../Bars.schema'
import { scatterPlotEditorSchema } from '../ScatterPlots.schema'
import {
  genericMapEditorSchema,
  projectedMapEditorSchema,
  swissMapEditorSchema,
} from '../Maps.schema'
import { hemicycleEditorSchema } from '../Hemicycle.schema'
import { tableEditorSchema } from '../Table.schema'
import {
  numberFormats,
  timeFormats,
  xScaleTypes,
  yScaleTypes,
  sortingOptions,
  timeParsing,
  chartSizes,
  columnAmount,
} from './utils'

const schemaDictFullSupport = {
  Line: lineEditorSchema,
  Bar: barEditorSchema,
  TimeBar: timeBarEditorSchema,
  Lollipop: lollipopEditorSchema,
  Slope: slopeEditorSchema,
}

const schemaDict = {
  ...schemaDictFullSupport,
  // not shown in UI for now, schema are not 100% ready
  ScatterPlot: scatterPlotEditorSchema,
  GenericMap: genericMapEditorSchema,
  ProjectedMap: projectedMapEditorSchema,
  SwissMap: swissMapEditorSchema,
  Hemicycle: hemicycleEditorSchema,
  Table: tableEditorSchema,
}

const chartTranslationDict = {
  Line: 'Linien (Line)',
  Bar: 'Balken (Bar)',
  TimeBar: 'Säulen (TimeBar)',
  Lollipop: 'Lollipop',
  Slope: 'Steigungslinien (Slope)',
}

const chartTypes = Object.keys(schemaDictFullSupport).map((d) => {
  return { value: d, text: chartTranslationDict[d] }
})

const ChartEditor = ({ data, value, onChange, activeTab }) => {
  const chartData = useMemo(() => csvParse(data), [data])

  if (!chartData?.columns) {
    return
  }

  const columns = chartData.columns.map((d) => {
    return { value: d, text: d }
  })

  const onFieldsChange = (newValues) => {
    onChange({ ...value, ...newValues })
  }

  const createOnFieldChange = (key) => {
    return (_, newValue) => {
      onChange({ ...value, [key]: newValue })
    }
  }

  const createOnNumberFieldChange = (key) => {
    return (_, newValue) => {
      onChange({ ...value, [key]: Number(newValue) })
    }
  }

  const createOnDropdownChange = (key) => (item) => {
    return onChange({ ...value, [key]: item.value || undefined })
  }

  const createSchema = (type = 'Line') => {
    return schemaDict[type]({
      dataColumnEnum: columns,
      optionalDataColumnEnum: columns.concat({
        value: '',
        text: 'keine Auswahl',
      }),
      defaults: defaultProps[type],
      numberFormats,
      xScaleTypes,
      yScaleTypes,
      timeFormats,
      sortingOptions,
      timeParsing,
      chartSizes,
      columnAmount,
    })
  }

  const schema = createSchema(value.type)

  return (
    <div>
      <CustomValueDropdown
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
        defaultProps={schema.defaultProps}
      />
    </div>
  )
}

export default ChartEditor

import React, { useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Field from '../Form/Field'
import Dropdown from '../Form/Dropdown'
import Checkbox from '../Form/Checkbox'
import { Interaction, fontStyles } from '../Typography'
import { useColorContext } from '../Colors/ColorContext'
import { useCommaField } from './ChartEditor.utils'

import { timeParse } from '../../lib/timeFormat'
import { getFormat } from './utils'
import { defaultProps } from './ChartContext'
import { lineEditorSchema } from './Lines'
import { timeBarEditorSchema } from './TimeBars'

// TODO: there is also a xNumberFormat option if some is using a linear xScale and the yNumberFormat
// is not machting the xNumberFormat. Should we include this?
const numberFormats = [
  {
    value: '.0%',
    text: '20%'
  },
  {
    value: '.0f',
    text: '20'
  },
  {
    value: '.1f',
    text: '20,0'
  }
]

const xScaleTypes = [
  {
    value: 'time',
    text: 'zeitlich'
  },
  {
    value: 'linear',
    text: 'linear'
  },
  {
    value: 'ordinal',
    text: 'ordinal'
  }
]

const yScaleTypes = [
  {
    value: 'linear',
    text: 'linear'
  },
  {
    value: 'log',
    text: 'logarithmisch'
  }
]

const timeFormats = [
  {
    value: '%Y',
    text: '2015, 2016'
  },
  {
    value: '%d.%m.%Y',
    text: '26.02.2017, 24.02.2018'
  }
]

const styles = {
  orderBy: css({
    ...fontStyles.sansSerifRegular16,
    outline: 'none',
    WebkitAppearance: 'none',
    background: 'transparent',
    border: 'none',
    padding: '0',
    cursor: 'pointer',
    marginRight: '20px'
  }),
  regular: css({
    textDecoration: 'none'
  }),
  selected: css({
    textDecoration: 'underline',
    textDecorationSkip: 'ink'
  }),
  tabs: css({
    margin: '20px 0px'
  }),
  gridContainer: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '50px 30px',
    gridTemplateAreas: '"xaxis yaxis" "color layout"',
    margin: '20px 0'
  })
}

const chartTypes = [
  {
    value: 'Line',
    text: 'Linie'
  },
  {
    value: 'TimeBar',
    text: 'Balken über Zeit'
  },
  {
    value: 'Bar',
    text: 'Balken'
  }
]

const tabs = [
  { value: 'basic', text: 'Grundeinstellungen' },
  {
    value: 'advanced',
    text: 'Erweiterte Optionen'
  }
]

const ChartEditor = ({ data, value, onChange }) => {
  const [colorScheme] = useColorContext()
  const [activeTab, setActiveTab] = useState('basic')
  const chartData = useMemo(() => csvParse(data), [data])

  const createRanges = ({
    neutral,
    sequential,
    sequential3,
    opposite3,
    discrete
  }) => {
    const oppositeReversed = [].concat(opposite3).reverse()
    return {
      diverging1: [sequential3[1], opposite3[1]],
      diverging1n: [sequential3[1], neutral, opposite3[1]],
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

  const colorRangesArray = Object.keys(colorRanges)

  const colorDropdownItems = colorRangesArray.map((d, i) => {
    return {
      value: d,
      text: d,
      element: (
        <ColorElement key={'colorRange' + i} colorRange={colorRanges[d]} />
      )
    }
  })

  const columnNames = Object.keys(chartData[0])

  const columns = columnNames.map(d => {
    return { value: d, text: d }
  })

  const schema =
    value.type === 'Line'
      ? lineEditorSchema({
          fields: columns,
          defaults: defaultProps.Line,
          numberFormats,
          xScaleTypes,
          yScaleTypes,
          timeFormats,
          colorDropdownItems
        })
      : timeBarEditorSchema({
          fields: columns,
          defaults: defaultProps.TimeBar,
          numberFormats,
          xScaleTypes,
          yScaleTypes,
          timeFormats,
          colorDropdownItems
        })

  const xAxis = schema.properties.xAxis.properties
  const yAxis = schema.properties.yAxis.properties
  const colorFields = schema.properties.color.properties
  const layout = schema.properties.layout.properties

  const createOnFieldChange = key => {
    return (_, newValue) => {
      onChange({ ...value, [key]: newValue })
    }
  }

  const createOnDropdownChange = key => item => {
    return onChange({ ...value, [key]: item.value })
  }

  const handleTabClick = () => {
    setActiveTab(activeTab === 'basic' ? 'advanced' : 'basic')
  }

  const hoverRule = useMemo(() => {
    return css({
      '@media (hover)': {
        ':hover': {
          color: colorScheme.getCSSColor('textSoft')
        }
      }
    })
  }, [colorScheme])

  return (
    <div>
      <div {...styles.tabs}>
        {tabs.map(d => {
          return (
            <a
              key={d.value}
              {...styles.orderBy}
              {...colorScheme.set('color', 'text')}
              {...styles[activeTab === d.value ? 'selected' : 'regular']}
              {...(activeTab !== d.value && hoverRule)}
              onClick={handleTabClick}
            >
              {d.text}
            </a>
          )
        })}
      </div>

      {activeTab === 'basic' ? (
        <BasicSettings
          columns={columns}
          value={value}
          createOnDropdownChange={createOnDropdownChange}
          createOnFieldChange={createOnFieldChange}
          xAxis={xAxis}
          yAxis={yAxis}
          colorFields={colorFields}
          layout={layout}
        />
      ) : (
        <AdvancedSettings
          columns={columns}
          value={value}
          createOnDropdownChange={createOnDropdownChange}
          createOnFieldChange={createOnFieldChange}
          colorDropdownItems={colorDropdownItems}
        />
      )}
    </div>
  )
}

const BasicSettings = props => {
  const {
    value,
    createOnDropdownChange,
    createOnFieldChange,
    xAxis,
    yAxis,
    colorFields,
    layout
  } = props

  const timeFormatParser = timeParse(
    value.timeParse || value.timeFormat || '%Y'
  )
  const [xTicksField, onXTicksChange] = useCommaField(
    value.xTicks,
    createOnFieldChange('xTicks'),
    timeFormatParser
  )

  const numberFormatParser = getFormat(value.numberFormat || '.1f')
  const [yTicksField, onYTicksChange] = useCommaField(
    value.xTicks,
    createOnFieldChange('yTicks'),
    numberFormatParser
  )

  const xAxisKeys = Object.keys(xAxis)
  const yAxisKeys = Object.keys(yAxis)
  const colorFieldsKeys = Object.keys(colorFields)
  const layoutKeys = Object.keys(layout)

  const generateFormFields = (key, groupObject) => {
    if (Object.prototype.hasOwnProperty.call(groupObject[key], 'enum')) {
      return (
        <Dropdown
          key={key}
          label={groupObject[key].title}
          items={groupObject[key].enum}
          value={value[key] || groupObject[key].default}
          onChange={createOnDropdownChange(key)}
        />
      )
    } else if (key === 'xTicks') {
      return (
        <Field
          key={key}
          label={groupObject[key].title}
          value={xTicksField.value}
          error={xTicksField.error && 'Fehler in Achsenticks'}
          onChange={onXTicksChange}
        />
      )
    } else if (key === 'yTicks') {
      return (
        <Field
          key={key}
          label={groupObject[key].title}
          value={yTicksField.value}
          error={yTicksField.error && 'Fehler in Achsenticks'}
          onChange={onYTicksChange}
        />
      )
    } else if (groupObject[key].type === 'boolean') {
      return (
        <Checkbox
          key={key}
          checked={value[key]}
          onChange={createOnFieldChange(key)}
        >
          {groupObject[key].title}
        </Checkbox>
      )
    } else {
      return (
        <Field
          key={key}
          label={groupObject[key].title}
          value={value.key || groupObject[key].default}
          onChange={createOnFieldChange(key)}
        />
      )
    }
  }

  return (
    <div>
      <Dropdown
        label='Charttyp auswählen'
        items={chartTypes}
        value={value.type}
        onChange={createOnDropdownChange('type')}
      />
      <div {...styles.gridContainer}>
        <div className='xaxis'>
          <Interaction.H3>Horizontale Achse</Interaction.H3>
          {xAxisKeys.map(d => generateFormFields(d, xAxis))}
        </div>
        <div className='yaxis'>
          <Interaction.H3>Vertikale Achse</Interaction.H3>
          {yAxisKeys.map(d => generateFormFields(d, yAxis))}
        </div>
        <div className='color'>
          <Interaction.H3>Farbe</Interaction.H3>
          {colorFieldsKeys.map(d => generateFormFields(d, colorFields))}
        </div>
        <div className='layout'>
          <Interaction.H3>Layout</Interaction.H3>
          {layoutKeys.map(d => generateFormFields(d, layout))}
        </div>
      </div>
    </div>
  )
}

const AdvancedSettings = props => {
  const { value, createOnFieldChange } = props
  return (
    <div {...styles.gridContainer}>
      <div className='yaxis'>
        <Interaction.H3>Vertikale Achse</Interaction.H3>
        <Checkbox checked={value.zero} onChange={createOnFieldChange('zero')}>
          Y-Achse bei 0 beginnen
        </Checkbox>
      </div>
    </div>
  )
}

const ColorElement = props => {
  const { colorRange } = props
  return (
    <div style={{ display: 'flex', height: '25px', marginRight: '50px' }}>
      {colorRange.map((d, i) => (
        <span
          key={d + i}
          style={{
            display: 'inline-block',
            flex: 1,
            backgroundColor: d
          }}
        />
      ))}
    </div>
  )
}

export default ChartEditor

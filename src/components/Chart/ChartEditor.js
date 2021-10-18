import React, { useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Field from '../Form/Field'
import Dropdown from '../Form/Dropdown'
import Checkbox from '../Form/Checkbox'
import Slider from '../Form/Slider'
import { Interaction, fontStyles } from '../Typography'
import { useColorContext } from '../Colors/ColorContext'
import { useCommaField } from './ChartEditor.utils'

import { timeParse } from '../../lib/timeFormat'
import { getFormat } from './utils'
import { defaultProps } from './ChartContext'

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
          colorDropdownItems={colorDropdownItems}
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
    columns,
    value,
    createOnDropdownChange,
    createOnFieldChange,
    colorDropdownItems
  } = props

  const [showCustomColors, setShowCustomColors] = useState(false)

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

  const handleShowCustomColors = () => {
    showCustomColors ? setShowCustomColors(false) : setShowCustomColors(true)
  }

  return (
    <div>
      <Dropdown
        label='Charttyp auswählen'
        items={chartTypes}
        value={value.type || 'type'}
        onChange={createOnDropdownChange('type')}
      />
      <div {...styles.gridContainer}>
        <div className='xaxis'>
          <Interaction.H3>Horizontale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={columns}
            value={value.x || 'year'}
            onChange={createOnDropdownChange('x')}
          />
          <Dropdown
            label='Achsenformat'
            items={timeFormats}
            value={value.timeFormat || '%Y'}
            onChange={createOnDropdownChange('timeFormat')}
          />
          <Field
            label='Achsenticks'
            value={xTicksField.value}
            error={xTicksField.error && 'Fehler in Achsenticks'}
            onChange={onXTicksChange}
          />
          <Field
            label='Beschriftung'
            value={value.xUnit || ''}
            onChange={createOnFieldChange('xUnit')}
          />
          <Dropdown
            label='Skalierungstyp'
            items={xScaleTypes}
            value={value.xScale || 'time'}
            onChange={createOnDropdownChange('xScale')}
          />
        </div>
        <div className='yaxis'>
          <Interaction.H3>Vertikale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={columns}
            value={value.y || 'value'}
            onChange={createOnDropdownChange('y')}
          />
          <Dropdown
            label='Achsenformat'
            items={numberFormats}
            value={value.numberFormat || '.0%'}
            onChange={createOnDropdownChange('numberFormat')}
          />
          <Field
            label='Achsenticks'
            value={yTicksField.value}
            error={yTicksField.error && 'Fehler in Achsenticks'}
            onChange={onYTicksChange}
          />
          <Field
            label='Beschriftung'
            value={value.unit || ''}
            onChange={createOnFieldChange('unit')}
          />
          <Dropdown
            label='Skalierungstyp'
            items={yScaleTypes}
            value={value.yScale || 'linear'}
            onChange={createOnDropdownChange('yScale')}
          />
        </div>
        <div className='color'>
          <Interaction.H3>Farbe</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={columns.concat({ text: '', value: '' })}
            value={value.color || ''}
            onChange={createOnDropdownChange('color')}
          />
          <Dropdown
            label='Farbschema auswählen'
            items={colorDropdownItems}
            value={value.colorRange || 'diverging1'}
            onChange={createOnDropdownChange('colorRange')}
          />
          {value.color && (
            <Checkbox
              checked={showCustomColors}
              onChange={handleShowCustomColors}
            >
              Farben direkt zuweisen
            </Checkbox>
          )}
        </div>
        <div className='layout'>
          <Interaction.H3>Layout</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={columns.concat({ text: '', value: '' })}
            value={value.column || ''}
            onChange={createOnDropdownChange('column')}
          />
          <Slider
            label={'Anzahl Spalten pro Zeile'}
            value={value.columns || '1'}
            min='1'
            max='6'
            fullWidth
            onChange={createOnFieldChange('columns')}
          />
        </div>
      </div>
    </div>
  )
}

const AdvancedSettings = props => {
  const {
    columns,
    value,
    createOnDropdownChange,
    createOnFieldChange,
    colorDropdownItems
  } = props
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

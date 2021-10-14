import React, { useRef, useEffect, useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Field from '../Form/Field'
import Dropdown from '../Form/Dropdown'
import { Interaction, fontStyles } from '../Typography'
import { useColorContext } from '../Colors/ColorContext'

const styles = {
  wrapper: css({}),
  row: css({
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: '100%',
    justifyContent: 'space-between'
  }),
  column: css({
    width: '48%',
    position: 'relative'
  }),
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
  })
}

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

  const columnNames = Object.keys(chartData[0])

  const xAxisColumns = columnNames.map(d => {
    return { value: d, text: d }
  })

  const createOnFieldChange = key => {
    return (_, newValue) => {
      let splitTicks
      if (key === 'xTicks') {
        splitTicks = newValue.split(',')
        console.log(splitTicks)
        newValue = splitTicks
      }
      onChange({ ...value, [key]: newValue })
    }
  }

  const createOnDropdownChange = (key, item) => {
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
          xAxisColumns={xAxisColumns}
          value={value}
          createOnDropdownChange={createOnDropdownChange}
          createOnFieldChange={createOnFieldChange}
        />
      ) : (
        <AdvancedSettings />
      )}
    </div>
  )
}

const BasicSettings = props => {
  const {
    xAxisColumns,
    value,
    createOnDropdownChange,
    createOnFieldChange
  } = props
  return (
    <div {...styles.wrapper}>
      <div {...styles.row}>
        <div {...styles.column}>
          <Interaction.H3>Horizontale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={xAxisColumns}
            value={value.x === undefined ? 'year' : value.x}
            onChange={item => {
              createOnDropdownChange('x', item)
            }}
          />
          <Dropdown
            label='Achsenformat'
            items={timeFormats}
            value={value.timeFormat === undefined ? '%Y' : value.timeFormat}
            onChange={item => {
              props.createOnDropdownChange('timeFormat', item)
            }}
          />
          <Field
            label='Achsenticks'
            value={value.xTicks === undefined ? '' : value.xTicks}
            onChange={createOnFieldChange('xTicks')}
          />
          <Field
            label='Beschriftung'
            value={value.xUnit === undefined ? '' : value.xUnit}
            onChange={createOnFieldChange('xUnit')}
          />
        </div>
        <div {...styles.column}>
          <Interaction.H3>Vertikale Achse</Interaction.H3>
          <Dropdown
            label='Spalte auswählen'
            items={xAxisColumns}
            value={value.x === undefined ? '.0%' : value.x}
            onChange={item => {
              createOnDropdownChange('x', item)
            }}
          />
          <Dropdown
            label='Achsenformat'
            items={numberFormats}
            value={
              value.numberFormat === undefined ? '.0%' : value.numberFormat
            }
            onChange={item => {
              createOnDropdownChange('numberFormat', item)
            }}
          />
        </div>
      </div>
    </div>
  )
}

const AdvancedSettings = props => {
  return <div>No settings yet</div>
}

export default ChartEditor

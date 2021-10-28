import React, { useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Dropdown from '../../Form/Dropdown'
import { FormFields } from './FormFields'
import { ColorDropdownElement } from './ColorDropdownElement'

import { fontStyles } from '../../Typography'
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
  yScaleTypes
} from './Editor.utils'

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

  const colorDropdownItems = colorRangesArray
    .map((d, i) => {
      return {
        value: d,
        text: d,
        element: (
          <ColorDropdownElement
            key={'colorRange' + i}
            colorRange={colorRanges[d]}
          />
        )
      }
    })
    .concat({ value: '', text: 'automatisch' })

  const columns = Object.keys(chartData[0]).map(d => {
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

  const timeFormatParser = timeParse(
    value.timeParse || value.timeFormat || '%Y'
  )

  const numberFormatParser = getFormat(value.numberFormat || 's')

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
      <Dropdown
        label='Charttyp auswählen'
        items={chartTypes}
        value={value.type}
        onChange={createOnDropdownChange('type')}
      />

      <FormFields
        createOnFieldChange={createOnFieldChange}
        createOnDropdownChange={createOnDropdownChange}
        timeFormatParser={timeFormatParser}
        numberFormatParser={numberFormatParser}
        value={value}
        fields={
          activeTab === 'basic'
            ? schema.properties.basic
            : schema.properties.advanced
        }
      />
    </div>
  )
}

export default ChartEditor

import React, { useState, useMemo } from 'react'
import { css } from 'glamor'
import { csvParse } from 'd3-dsv'

import Field from '../../Form/Field'
import Dropdown from '../../Form/Dropdown'
import Checkbox from '../../Form/Checkbox'
import { TickField } from './TickField'
import { FormFields } from './FormFields'
import { ColorDropdownElement } from './ColorDropdownElement'

import { Interaction, fontStyles } from '../../Typography'
import { useColorContext } from '../../Colors/ColorContext'

import { timeParse } from '../../../lib/timeFormat'
import { getFormat } from '../utils'
import { defaultProps } from '../ChartContext'
import { lineEditorSchema } from '../Lines'
import { timeBarEditorSchema } from '../TimeBars'

// TODO: there is also a xNumberFormat option if some is using a linear xScale and the yNumberFormat
// is not machting the xNumberFormat. Should we include this?
const numberFormats = [
  {
    value: 's',
    text: '8, 12, 85'
  },
  {
    value: '.0%',
    text: '8%, 12%, 85%'
  },
  {
    value: '.1f',
    text: '20,0'
  },
  {
    value: '.2f',
    text: '8, 12, 85'
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
        <ColorDropdownElement
          key={'colorRange' + i}
          colorRange={colorRanges[d]}
        />
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

  const timeFormatParser = timeParse(
    value.timeParse || value.timeFormat || '%Y'
  )

  const numberFormatParser = getFormat(value.numberFormat || '.1f')

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

  const generateFormFields = (property, groupObject) => {
    if (Object.prototype.hasOwnProperty.call(groupObject[property], 'enum')) {
      return (
        <Dropdown
          key={property}
          label={groupObject[property].title}
          items={groupObject[property].enum}
          value={value[property] || groupObject[property].default}
          onChange={createOnDropdownChange(property)}
        />
      )
    } else if (groupObject[property].type === 'array') {
      return (
        <TickField
          key={property}
          property={property}
          groupObject={groupObject}
          value={value.property || groupObject[property].default}
          createOnFieldChange={createOnFieldChange}
          parser={property === 'xTicks' ? timeFormatParser : numberFormatParser}
        />
      )
    } else if (groupObject[property].type === 'boolean') {
      return (
        <Checkbox
          key={property}
          checked={value[property]}
          onChange={createOnFieldChange(property)}
        >
          {groupObject[property].title}
        </Checkbox>
      )
    } else {
      return (
        <Field
          key={property}
          label={groupObject[property].title}
          value={value.property || groupObject[property].default}
          onChange={createOnFieldChange(property)}
        />
      )
    }
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
      <Dropdown
        label='Charttyp auswählen'
        items={chartTypes}
        value={value.type}
        onChange={createOnDropdownChange('type')}
      />

      {activeTab === 'basic' ? (
        <BasicSettings
          generateFormFields={generateFormFields}
          schema={schema}
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
  const { generateFormFields, schema } = props

  return (
    <div>
      <FormFields
        generateFormFields={generateFormFields}
        fields={schema.properties}
      />
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

export default ChartEditor

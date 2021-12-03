import React, { useState, useMemo } from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import SizeSelector from './SizeSelector'

import { css } from 'glamor'
import {
  fontStyles,
  useColorContext,
  ChartEditor as WYSIWYGChartEditor
} from '@project-r/styleguide'

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
  })
}

const tabs = [
  { value: 'basic', text: 'Grundeinstellungen' },
  {
    value: 'advanced',
    text: 'Erweiterte Optionen'
  },
  {
    value: 'json',
    text: 'JSON'
  }
]

const ChartEditor = ({ data, onChange }) => {
  const [colorScheme] = useColorContext()
  const [activeTab, setActiveTab] = useState('basic')

  const handleTabClick = item => {
    setActiveTab(item.target.value)
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
    <>
      <PlainEditor
        label='CSV Daten'
        value={data.get('values')}
        onChange={value => onChange(data.set('values', value))}
        linesShown={10}
        onPaste={e => {
          const clipboardData = e.clipboardData || window.clipboardData
          let parsedTsv
          try {
            parsedTsv = tsvParse(clipboardData.getData('Text'))
          } catch (e) {}
          if (parsedTsv && parsedTsv.columns.length > 1) {
            e.preventDefault()
            onChange(data.set('values', csvFormat(parsedTsv)))
          }
        }}
      />
      <div {...styles.tabs}>
        {tabs.map(d => {
          return (
            <button
              key={d.value}
              {...styles.orderBy}
              {...colorScheme.set('color', 'text')}
              {...styles[activeTab === d.value ? 'selected' : 'regular']}
              {...(activeTab !== d.value && hoverRule)}
              value={d.value}
              onClick={handleTabClick}
            >
              {d.text}
            </button>
          )
        })}
      </div>
      {activeTab !== 'json' && (
        <>
          {activeTab === 'basic' && (
            <SizeSelector onChange={onChange} data={data} />
          )}
          <WYSIWYGChartEditor
            data={data.get('values')}
            value={data.get('config')}
            onChange={newConfig => {
              onChange(data.set('config', newConfig))
            }}
            activeTab={activeTab}
          />
        </>
      )}
      {activeTab === 'json' && (
        <>
          <JSONEditor
            label='Einstellungen'
            config={data.get('config')}
            onChange={newConfig => {
              onChange(data.set('config', newConfig))
            }}
          />
        </>
      )}
    </>
  )
}

export default ChartEditor

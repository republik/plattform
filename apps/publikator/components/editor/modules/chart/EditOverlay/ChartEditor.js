import { ChartEditor, Scroller, TabButton } from '@project-r/styleguide'
import { csvFormat, tsvParse } from 'd3-dsv'
import { useState } from 'react'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import SizeSelector from './SizeSelector'

const tabs = [
  { value: 'basic', text: 'Grundeinstellungen' },
  {
    value: 'advanced',
    text: 'Erweiterte Optionen',
  },
  {
    value: 'json',
    text: 'JSON',
  },
]

const ChartEditorWrapper = ({ data, onChange }) => {
  const hasNoData = !data.get('values')[0]
  const [activeTab, setActiveTab] = useState(hasNoData ? 'json' : 'basic')

  return (
    <>
      <PlainEditor
        label='CSV Daten'
        value={data.get('values')}
        onChange={(value) => onChange(data.set('values', value))}
        linesShown={10}
        onPaste={(e) => {
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
      <div style={{ margin: '20px 0px' }}>
        <Scroller
          activeChildIndex={tabs.findIndex(({ value }) => value === activeTab)}
        >
          {tabs.map(({ value, text }) => (
            <TabButton
              key={value}
              text={text}
              isActive={activeTab === value}
              onClick={() => {
                setActiveTab(value)
              }}
            />
          ))}
        </Scroller>
      </div>
      {activeTab !== 'json' ? (
        <>
          {activeTab === 'basic' && hasNoData && (
            <span>
              Füge zuerst Daten in das Feld CSV Daten ein. Du kannst einfach aus
              einem Tabellenprogramm kopieren und oben einfügen.
            </span>
          )}

          <ChartEditor
            data={data.get('values')}
            value={data.get('config')}
            onChange={(newConfig) => {
              onChange(data.set('config', newConfig))
            }}
            activeTab={activeTab}
          />
        </>
      ) : (
        <>
          <SizeSelector onChange={onChange} data={data} />
          <JSONEditor
            label='Einstellungen'
            config={data.get('config')}
            onChange={(newConfig) => {
              onChange(data.set('config', newConfig))
            }}
          />
        </>
      )}
    </>
  )
}

export default ChartEditorWrapper

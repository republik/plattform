import React from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import SizeSelector from './SizeSelector'

const ChartEditor = ({ data, onChange }) => {
  return (
    <>
      <SizeSelector onChange={onChange} data={data} />
      <JSONEditor
        label='Einstellungen'
        config={data.get('config')}
        onChange={newConfig => {
          onChange(data.set('config', newConfig))
        }}
      />
      <PlainEditor
        label='CSV Daten'
        value={data.get('values')}
        onChange={value => onChange(data.set('values', value))}
        linesShown={20}
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
    </>
  )
}

export default ChartEditor

import React, { useContext, useEffect } from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'
import { JSONEditor, PlainEditor } from '../../../utils/CodeEditorFields'
import ChartSelector from './ChartSelector'
import SizeSelector from './SizeSelector'
import {
  AccordionItem,
  AccordionItemHeader,
  AccordionItemBody,
  AccordionContext
} from '@project-r/styleguide'

const ChartEditor = ({ data, onChange, CsvChart }) => {
  const { activeItemIndex, setActiveItemIndex } = useContext(AccordionContext)

  useEffect(() => {
    const config = data.get('config') || {}
    setActiveItemIndex(config.type ? 'configInput' : 'chartSelector')
  }, [])

  return (
    <>
      <AccordionItem eventKey='sizeSelector'>
        <AccordionItemHeader>Grösse ändern</AccordionItemHeader>
        <AccordionItemBody>
          <SizeSelector onChange={onChange} data={data} />
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem eventKey='chartSelector'>
        <AccordionItemHeader>Vorlage durchsuchen</AccordionItemHeader>
        <AccordionItemBody>
          <ChartSelector data={data} onChange={onChange} CsvChart={CsvChart} />
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem eventKey='dataInput'>
        <AccordionItemHeader>Daten bearbeiten</AccordionItemHeader>
        <AccordionItemBody>
          <PlainEditor
            label='CSV'
            value={data.get('values')}
            onChange={value => onChange(data.set('values', value))}
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
        </AccordionItemBody>
      </AccordionItem>
      <AccordionItem eventKey='configInput'>
        <AccordionItemHeader>Einstellungen anpassen</AccordionItemHeader>
        <AccordionItemBody>
          {activeItemIndex === 'configInput' && (
            <JSONEditor
              label='JSON'
              config={data.get('config')}
              onChange={newConfig => {
                onChange(data.set('config', newConfig))
              }}
            />
          )}
        </AccordionItemBody>
      </AccordionItem>
    </>
  )
}

export default ChartEditor

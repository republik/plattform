import React, { Fragment } from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'

import OverlayFormManager from '../../utils/OverlayFormManager'
import { JSONEditor, PlainEditor } from '../../utils/CodeEditorFields'

import { Interaction, Label, Radio } from '@project-r/styleguide'

import Export from './Export'
import { chartData, chartTypes } from './config'

export default props => (
  <OverlayFormManager
    {...props}
    extra={<Export chart={props.preview} />}
    onChange={data => {
      props.editor.change(change => {
        const size = data.get('config', {}).size
        const parent = change.value.document.getParent(props.node.key)
        if (size !== parent.data.get('size')) {
          change.setNodeByKey(parent.key, {
            data: parent.data.set('size', size)
          })
        }
        change.setNodeByKey(props.node.key, {
          data
        })
      })
    }}
  >
    {({ data, onChange }) => {
      const config = data.get('config') || {}
      console.log('config', config)

      return (
        <Fragment>
          <Interaction.P>
            <Label>Size</Label>
            <br />
            {[
              { label: 'Normal', size: undefined },
              { label: 'Klein', size: 'narrow' },
              { label: 'Gross', size: 'breakout' },
              { label: 'Links', size: 'floatTiny' }
            ].map(({ label, size }) => {
              const checked = config.size === size
              return (
                <Fragment key={size || label}>
                  <Radio
                    checked={checked}
                    onChange={() => {
                      if (!checked) {
                        onChange(data.set('config', { ...config, size }))
                      }
                    }}
                    style={{ whiteSpace: 'nowrap', marginRight: 10 }}
                  >
                    {label || size}
                  </Radio>{' '}
                </Fragment>
              )
            })}
          </Interaction.P>
          <Interaction.P>
            <Label>Typ</Label>
            <br />
            {chartTypes.map(type => {
              const checked = config.type === type
              return (
                <Fragment key={type}>
                  <Radio
                    checked={checked}
                    onChange={() => {
                      if (!checked) {
                        onChange(
                          data
                            .set('config', {
                              ...chartData[type].config,
                              size: config.size
                            })
                            .set('values', chartData[type].values.trim())
                        )
                      }
                    }}
                    style={{ whiteSpace: 'nowrap', marginRight: 10 }}
                  >
                    {type}
                  </Radio>{' '}
                </Fragment>
              )
            })}
          </Interaction.P>
          <JSONEditor
            label='JSON Config'
            value={config}
            onChange={value => {
              onChange(data.set('config', value))
            }}
          />
          <PlainEditor
            label='CSV Data'
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
        </Fragment>
      )
    }}
  </OverlayFormManager>
)

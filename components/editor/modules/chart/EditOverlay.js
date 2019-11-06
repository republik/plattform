import React, { Fragment } from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'

import OverlayFormManager from '../../utils/OverlayFormManager'
import JSONField, { renderAutoSize } from '../../utils/JSONField'

import { Interaction, Label, Field, Radio } from '@project-r/styleguide'

import Export from './Export'

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
            {[
              'Bar',
              'TimeBar',
              'Lollipop',
              'Line',
              'Slope',
              'ScatterPlot',
              'ProjectedMap',
              'SwissMap',
              'Hemicycle'
            ].map(type => {
              const checked = config.type === type
              return (
                <Fragment key={type}>
                  <Radio
                    checked={checked}
                    onChange={() => {
                      if (!checked) {
                        onChange(data.set('config', { ...config, type }))
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
          <Interaction.P>
            <JSONField
              label='JSON Config'
              value={config}
              onChange={value => {
                onChange(data.set('config', value))
              }}
            />
          </Interaction.P>
          <Interaction.P>
            <Field
              label='CSV Data'
              name='values'
              value={data.get('values')}
              renderInput={renderAutoSize({
                onPaste: e => {
                  const clipboardData = e.clipboardData || window.clipboardData
                  let parsedTsv
                  try {
                    parsedTsv = tsvParse(clipboardData.getData('Text'))
                  } catch (e) {}
                  if (parsedTsv && parsedTsv.columns.length > 1) {
                    e.preventDefault()
                    onChange(data.set('values', csvFormat(parsedTsv)))
                  }
                }
              })}
              onChange={(_, value) => {
                onChange(data.set('values', value))
              }}
            />
          </Interaction.P>
        </Fragment>
      )
    }}
  </OverlayFormManager>
)

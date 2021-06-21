import React, { Fragment } from 'react'
import { tsvParse, csvFormat } from 'd3-dsv'

import OverlayFormManager from '../../utils/OverlayFormManager'
import { JSONEditor, PlainEditor } from '../../utils/CodeEditorFields'

import { Interaction, Label, Radio, fontStyles } from '@project-r/styleguide'

import Export from './Export'
import { baseCharts } from './config'
import { css } from 'glamor'

const styles = {
  chartWrapper: css({
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridAutoRows: 120
  }),
  chartButton: css({
    whiteSpace: 'nowrap',
    padding: 30,
    textAlign: 'center',
    ...fontStyles.sansSerifRegular14,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }),
  chartImage: css({
    height: 'auto',
    width: 40
  }),
  chartButtonText: css({
    display: 'block',
    marginTop: 'auto'
  })
}

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
            <Label>Base Config</Label>
            <br />
            <div {...styles.chartWrapper}>
              {baseCharts.map(chart => {
                return (
                  <div
                    key={chart.name}
                    {...styles.chartButton}
                    onClick={() => {
                      onChange(
                        data
                          .set('config', {
                            ...chart.config,
                            size: config.size
                          })
                          .set('values', chart.values.trim())
                      )
                    }}
                  >
                    <img src={chart.screenshot} {...styles.chartImage} />
                    <span {...styles.chartButtonText}>{chart.name}</span>
                  </div>
                )
              })}
            </div>
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

import React from 'react'
import { css } from 'glamor'
import { tsvParse, csvFormat } from 'd3-dsv'

import {
  Overlay,
  OverlayToolbar,
  OverlayToolbarClose,
  OverlayBody,
  Interaction,
  Label,
  Field,
  Radio,
  mediaQueries
} from '@project-r/styleguide'

import { gray2x1 } from '../../utils/placeholder'

import JSONField, { renderAutoSize } from './JSONField'

const previewWidth = 290

const styles = {
  editButton: css({
    position: 'absolute',
    left: -40,
    top: 0,
    zIndex: 1,
    fontSize: 24,
    ':hover': {
      cursor: 'pointer'
    }
  }),
  preview: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: previewWidth
    }
  }),
  edit: css({
    [mediaQueries.mUp]: {
      float: 'left',
      width: `calc(100% - ${previewWidth}px)`,
      paddingLeft: 20
    }
  })
}

const EditModal = ({data, onChange, onClose, chart}) => {
  const config = data.get('config') || {}
  return (
    <div onDragStart={e => {
      e.stopPropagation()
    }} onClick={e => {
      e.stopPropagation()
    }}>
      <Overlay onClose={onClose} mUpStyle={{maxWidth: '80vw', marginTop: '5vh'}}>
        <OverlayToolbar>
          <OverlayToolbarClose onClick={onClose} />
        </OverlayToolbar>

        <OverlayBody>
          <div {...styles.preview}>
            {
              (data.get('values') || '').length &&
              Object.keys(config).length
                ? chart
                : <img src={gray2x1} width='100%' />
            }
          </div>
          <div {...styles.edit}>
            <Interaction.P>
              <Label>Size</Label><br />
              {[
                {label: 'Normal', size: undefined},
                {label: 'Klein', size: 'narrow'},
                {label: 'Gross', size: 'breakout'},
                {label: 'Links', size: 'floatTiny'}
              ].map(({label, size}) => {
                const checked = config.size === size
                return (
                  <Radio key={size || label} checked={checked} onChange={() => {
                    if (!checked) {
                      onChange(data.set('config', {...config, size}))
                    }
                  }} style={{marginRight: 15}}>
                    {label || size}
                  </Radio>
                )
              })}
            </Interaction.P>
            <Interaction.P>
              <Label>Typ</Label><br />
              {['Bar', 'TimeBar', 'Lollipop', 'Line', 'Slope'].map(type => {
                const checked = config.type === type
                return (
                  <Radio key={type} checked={checked} onChange={() => {
                    if (!checked) {
                      onChange(data.set('config', {...config, type}))
                    }
                  }} style={{marginRight: 15}}>
                    {type}
                  </Radio>
                )
              })}
            </Interaction.P>
            <Interaction.P>
              <JSONField
                label='JSON Config'
                value={config}
                onChange={(value) => {
                  onChange(data.set('config', value))
                }} />
            </Interaction.P>
            <Interaction.P>
              <Field
                label='CSV Data'
                name='values'
                value={data.get('values')}
                renderInput={renderAutoSize({
                  onPaste: (e) => {
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
                }} />
            </Interaction.P>
          </div>
          <br style={{clear: 'both'}} />
        </OverlayBody>
      </Overlay>
    </div>
  )
}

export default EditModal

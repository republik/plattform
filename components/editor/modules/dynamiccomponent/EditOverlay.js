import React, { Fragment } from 'react'
import { fromJS } from 'immutable'

import OverlayFormManager from '../../utils/OverlayFormManager'
import JSONField from '../../utils/JSONField'

import {
  Interaction,
  Label,
  Radio
} from '@project-r/styleguide'

export default (props) => (
  <OverlayFormManager {...props}
    onChange={(data) => {
      props.editor.change(change => {
        change.setNodeByKey(props.node.key, {
          data
        })
      })
    }}>
    {({data, onChange}) => {
      const config = data.toJS()

      return (
        <Fragment>
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
                    onChange(data.set('size', size))
                  }
                }} style={{marginRight: 15}}>
                  {label || size}
                </Radio>
              )
            })}
          </Interaction.P>
          <Interaction.P>
            <JSONField
              label='Config'
              value={config}
              onChange={(value) => {
                onChange(fromJS(value))
              }} />
          </Interaction.P>
        </Fragment>
      )
    }}
  </OverlayFormManager>
)

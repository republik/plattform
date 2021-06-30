import React, { Fragment } from 'react'
import { Interaction, Label, Radio } from '@project-r/styleguide'
import { sizes } from './config'

const SizeSelector = ({ onChange, data }) => {
  const config = data.get('config') || {}
  return (
    <Interaction.P>
      <Label>Grösse wählen:</Label>
      <br />
      {sizes.map(({ label, size }) => {
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
  )
}

export default SizeSelector

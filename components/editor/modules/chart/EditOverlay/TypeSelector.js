import React, { Fragment, useState } from 'react'
import { Radio, Interaction, Label } from '@project-r/styleguide'
import { chartTypes } from './config'

const TypeSelector = () => {
  const [selected, select] = useState(undefined)
  return (
    <Interaction.P style={{ marginBottom: 20 }}>
      <Label>Chart Typ</Label>
      <br />
      {chartTypes.map(({ label, value }) => {
        const checked = value === selected
        return (
          <Fragment key={value || label}>
            <Radio
              checked={checked}
              onChange={() => {
                if (!checked) {
                  select(value)
                }
              }}
              style={{ whiteSpace: 'nowrap', marginRight: 10 }}
            >
              {label || value}
            </Radio>{' '}
          </Fragment>
        )
      })}
    </Interaction.P>
  )
}

export default TypeSelector

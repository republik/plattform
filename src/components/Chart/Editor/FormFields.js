import React from 'react'

import { css } from 'glamor'
import { Interaction } from '../../Typography'

const styles = {
  gridContainer: css({
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gridTemplateRows: '1fr',
    gap: '50px 30px',
    margin: '20px 0'
  })
}

export const FormFields = props => {
  const { fields, generateFormFields } = props
  const fieldsKeys = Object.keys(fields)
  return (
    <div {...styles.gridContainer}>
      {fieldsKeys.map(group => {
        return (
          <div key={group}>
            <Interaction.H3>{fields[group].title}</Interaction.H3>
            {Object.keys(fields[group].properties).map(property =>
              generateFormFields(property, fields[group].properties)
            )}
          </div>
        )
      })}
    </div>
  )
}

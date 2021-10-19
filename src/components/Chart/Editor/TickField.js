import React from 'react'

import Field from '../../Form/Field'
import { useCommaField } from './Editor.utils'

export const TickField = props => {
  const { property, groupObject, createOnFieldChange, parser, value } = props

  const [ticksField, onTicksChange] = useCommaField(
    value,
    createOnFieldChange(property),
    parser
  )

  return (
    <Field
      label={groupObject[property].title}
      value={ticksField.value}
      error={ticksField.error && 'Fehler in Achsenticks'}
      onChange={onTicksChange}
    />
  )
}

import React from 'react'

import Field from '../../Form/Field'
import { useCommaField } from './utils'
import { timeParse } from '../../../lib/timeFormat'

export const TickField = (props) => {
  const {
    property,
    groupObject,
    createOnFieldChange,
    value,
    config,
    context,
    timeParseDefault,
  } = props

  const timeFormatParser = timeParse(
    config.timeParse || config.timeFormat || timeParseDefault,
  )

  const parser =
    context === 'time'
      ? timeFormatParser
      : context === 'number'
      ? (d) => +d
      : undefined

  const [ticksField, onTicksChange] = useCommaField(
    value,
    createOnFieldChange(property),
    parser,
    context,
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

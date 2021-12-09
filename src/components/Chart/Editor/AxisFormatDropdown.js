import React from 'react'
import Dropdown from '../../Form/Dropdown'

import { numberFormats, timeFormats, timeParsing } from './Editor.utils'

export const AxisFormatDropdown = props => {
  const {
    property,
    context,
    value,
    onChange,
    timeParseDefault,
    timeParse,
    xNumberFormat,
    xNumberFormatDefault,
    parent
  } = props
  const isTimeContext = context === 'time'
  const isStringContext = context === 'string'
  const label = isTimeContext ? 'Datumsformat (Chart)' : 'Zahlenformat'
  const isOnXAxisAndNumber = context === 'number' && parent.match(/^x/)
  console.log(context)
  console.log(isOnXAxisAndNumber)
  return (
    <>
      {!isStringContext && !isOnXAxisAndNumber && (
        <Dropdown
          label={label}
          items={context === 'time' ? timeFormats : numberFormats}
          value={value}
          onChange={onChange(property)}
        />
      )}
      {isOnXAxisAndNumber && (
        <Dropdown
          label={label}
          items={numberFormats}
          value={xNumberFormat || xNumberFormatDefault}
          onChange={onChange('xNumberFormat')}
        />
      )}
      {isTimeContext && (
        <Dropdown
          label={'Datumsformat (Daten)'}
          items={timeParsing}
          value={timeParse || timeParseDefault}
          onChange={onChange('timeParse')}
        />
      )}
    </>
  )
}

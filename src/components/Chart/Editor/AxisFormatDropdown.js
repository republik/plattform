import React from 'react'
import CustomValueDropdown from './CustomValueDropdown'

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
  if (context === 'time') {
    return <>
      <CustomValueDropdown
        label='Datumsformat (Chart)'
        items={timeFormats}
        value={value}
        onChange={onChange(property)}
      />
      <CustomValueDropdown
        label='Datumsformat (Daten)'
        items={timeParsing}
        value={timeParse || timeParseDefault}
        onChange={onChange('timeParse')}
      />
    </>
  }
  if (context === 'number') {
    const isOnXAxis = parent.match(/^x/)
    return <CustomValueDropdown
      label='Zahlenformat'
      items={numberFormats}
      value={isOnXAxis ? xNumberFormat || xNumberFormatDefault : value}
      onChange={onChange(isOnXAxis ? 'xNumberFormat' : property)}
    />
  }
  return null
}

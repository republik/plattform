import React from 'react'
import CustomValueDropdown from './CustomValueDropdown'

import { numberFormats, timeFormats, timeParsing } from './utils'

export const AxisFormatDropdown = (props) => {
  const {
    property,
    context,
    value,
    onChange,
    timeParse,
    xNumberFormat,
    parent,
    defaultProps,
  } = props
  if (context === 'time') {
    return (
      <>
        <CustomValueDropdown
          label='Datumsformat (Chart)'
          items={timeFormats}
          value={value}
          onChange={onChange(property)}
        />
        <CustomValueDropdown
          label='Datumsformat (Daten)'
          items={timeParsing}
          value={timeParse || defaultProps.timeParse}
          onChange={onChange('timeParse')}
        />
      </>
    )
  }
  if (context === 'number') {
    const isOnXAxis = parent.match(/^x/)
    return (
      <CustomValueDropdown
        label='Zahlenformat'
        items={numberFormats}
        value={isOnXAxis ? xNumberFormat || defaultProps.xNumberFormat : value}
        onChange={onChange(isOnXAxis ? 'xNumberFormat' : property)}
      />
    )
  }
  return null
}

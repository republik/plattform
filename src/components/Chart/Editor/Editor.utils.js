import { useState } from 'react'

const parseCommaValue = (newValue = '') => {
  return newValue
    .split(',')
    .map(d => d.trim())
    .filter(Boolean)
}
const formatCommaValue = (value = []) => value.join(', ')

// hook to format comma separated input
export const useCommaField = (value, onChange, parser) => {
  const isInvalid = newValue => {
    try {
      return !parser(newValue)
    } catch (e) {
      return true
    }
  }

  const valueToField = (value = []) => ({
    error: value.some(isInvalid),
    value: formatCommaValue(value)
  })

  const [field, setField] = useState(valueToField(value))

  // maybe later, depends on if it can change on the outside
  // useEffect(() => {
  //   setField(valueToField(value))
  // }, [value])

  const onFieldValueChange = (_, newValue) => {
    const parsedValue = parseCommaValue(newValue)
    const error = parsedValue.some(isInvalid)
    setField({
      value: newValue,
      error
    })
    if (!error && formatCommaValue(value) !== formatCommaValue(parsedValue)) {
      onChange(_, parsedValue)
    }
  }

  return [field, onFieldValueChange]
}

// TODO: there is also a xNumberFormat option if some is using a linear xScale and the yNumberFormat
// is not machting the xNumberFormat. Should we include this?
export const numberFormats = [
  {
    value: 's',
    text: '4 505 80 Mio.'
  },
  {
    value: '.1f',
    text: '4,3 505,2 78000000'
  },
  {
    value: '.2f',
    text: '4,27 505,22 78000000'
  },
  {
    value: ',.1r',
    text: "4,3 500 80'000'000"
  },
  {
    value: '.0%',
    text: '4% 50% 80%'
  }
]

export const xScaleTypes = [
  {
    value: 'time',
    text: 'zeitlich'
  },
  {
    value: 'linear',
    text: 'linear'
  },
  {
    value: 'ordinal',
    text: 'ordinal'
  }
]

export const yScaleTypes = [
  {
    value: 'linear',
    text: 'linear'
  },
  {
    value: 'log',
    text: 'logarithmisch'
  }
]

export const timeFormats = [
  {
    value: '%Y',
    text: '2015, 2016'
  },
  {
    value: '%d.%m.%Y',
    text: '26.02.2017, 24.02.2018'
  }
]

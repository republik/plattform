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
    if (!parser) {
      return false
    }
    try {
      return parser(newValue) === null
    } catch (e) {
      console.error(e)
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
    text: 'Ganzzahl: 4'
  },
  {
    value: '.1f',
    text: 'Gleitkommazahl: 4,3'
  },
  {
    value: '.2f',
    text: 'Gleitkommazahl: 4,27'
  },
  {
    value: '.0%',
    text: 'Prozentsatz: 4%'
  },
  {
    value: '.1%',
    text: 'Prozentsatz: 4.2%'
  },
  {
    value: ',.1r',
    text: "Gruppierte Tausender: 80'000'000"
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
    text: '2017, 2018'
  },
  {
    value: '%d.%m.%Y',
    text: '26.01.2017, 24.02.2018'
  },
  {
    value: '%b %Y',
    text: 'Jan 2017, Feb 2018'
  }
]

export const timeParsing = [
  {
    value: '%Y',
    text: '2017, 2018'
  },
  {
    value: '%Y-%m-%d',
    text: '2017-01-26, 2018-02-24'
  },
  {
    value: '%d.%m.%Y',
    text: '26.01.2017, 24.02.2018'
  }
]

export const sortingOptions = [
  {
    value: 'none',
    text: 'keine'
  },
  {
    value: 'ascending',
    text: 'aufsteigend'
  },
  {
    value: 'descending',
    text: 'absteigend'
  }
]

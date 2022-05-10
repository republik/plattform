import { useState } from 'react'

const parseCommaValue = (newValue = '', context) => {
  return newValue
    .split(',')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => (context === 'number' ? +d : d))
}

const formatCommaValue = (value = []) => value.join(', ')

// hook to format comma separated input
export const useCommaField = (value, onChange, parser, context) => {
  const isInvalid = (newValue) => {
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
    value: formatCommaValue(value),
  })

  const [field, setField] = useState(valueToField(value))

  // maybe later, depends on if it can change on the outside
  // useEffect(() => {
  //   setField(valueToField(value))
  // }, [value])

  const onFieldValueChange = (_, newValue) => {
    const parsedValue = parseCommaValue(newValue, context)
    const error = parsedValue.some(isInvalid)
    setField({
      value: newValue,
      error,
    })
    if (!error && formatCommaValue(value) !== formatCommaValue(parsedValue)) {
      onChange(_, parsedValue.length > 0 ? parsedValue : undefined)
    }
  }

  return [field, onFieldValueChange]
}

export const numberFormats = [
  {
    value: 's',
    text: '4, 4000, 40’000, 40 Mio.',
  },
  {
    value: ',.0f',
    text: "4, 4000, 40’000, 40'000'000",
  },
  {
    value: '.1f',
    text: '4,3',
  },
  {
    value: '.2f',
    text: '4,27',
  },
  {
    value: '.0%',
    text: '4%',
  },
  {
    value: '.1%',
    text: '4.2%',
  },
]

export const xScaleTypes = [
  {
    value: 'time',
    text: 'zeitlich',
  },
  {
    value: 'linear',
    text: 'linear',
  },
  {
    value: 'ordinal',
    text: 'ordinal',
  },
]

export const yScaleTypes = [
  {
    value: 'linear',
    text: 'linear',
  },
  {
    value: 'log',
    text: 'logarithmisch',
  },
]

export const timeFormats = [
  {
    value: '%Y',
    text: '2017, 2018',
  },
  {
    value: '%d.%m.%Y',
    text: '26.01.2017, 24.02.2018',
  },
  {
    value: '%d.%m.',
    text: '26.01., 24.02.',
  },
  {
    value: '%b %Y',
    text: 'Jan 2017, Feb 2018',
  },
]

export const timeParsing = [
  {
    value: '%Y',
    text: '2017, 2018',
  },
  {
    value: '%Y-%m-%d',
    text: '2017-01-26, 2018-02-24',
  },
  {
    value: '%d.%m.%Y',
    text: '26.01.2017, 24.02.2018',
  },
]

export const sortingOptions = [
  {
    value: 'none',
    text: 'keine',
  },
  {
    value: 'ascending',
    text: 'aufsteigend',
  },
  {
    value: 'descending',
    text: 'absteigend',
  },
]

export const chartSizes = [
  {
    value: '',
    text: 'normal',
  },
  {
    value: 'breakout',
    text: 'gross',
  },
  {
    value: 'narrow',
    text: 'klein',
  },
  {
    value: 'floatTiny',
    text: 'links',
  },
]

export const columnAmount = [
  {
    value: 1,
    text: '1',
  },
  {
    value: 2,
    text: '2',
  },
  {
    value: 3,
    text: '3',
  },
  {
    value: 4,
    text: '4',
  },
]

// Note: This could and probably should be refactored away
// when supporting more charts and be infered from the schemas
export const determineAxisContext = (
  currentProperty,
  chartConfig,
  defaultProps,
) => {
  const xScale = chartConfig.xScale || defaultProps.xScale
  if (currentProperty.match(/^x/)) {
    if (chartConfig.type === 'Bar' || chartConfig.type === 'Lollipop') {
      return 'number'
    }
    if (chartConfig.type === 'TimeBar') {
      return xScale === 'ordinal' || xScale === 'linear' ? 'string' : 'time'
    }
    if (chartConfig.type === 'Line') {
      return xScale === 'ordinal'
        ? 'string'
        : xScale === 'linear'
        ? 'number'
        : 'time'
    } else {
      return 'time'
    }
  }
  return 'number'
}

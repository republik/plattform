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

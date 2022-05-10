import { useState, useCallback, useEffect, useMemo } from 'react'

import FieldSet from '../FieldSet'

const getValues = (fields, defaultValues) =>
  fields.reduce((acumulator, { name }) => {
    acumulator[name] = defaultValues[name] || ''
    return acumulator
  }, {})

export const useFieldSetState = (fields, defaultValues) => {
  const [state, setState] = useState(() => {
    const values = getValues(fields, defaultValues)
    return {
      values,
      errors: FieldSet.utils.getErrors(fields, values),
      dirty: {},
    }
  })

  const onChange = useCallback((newState) => {
    setState(FieldSet.utils.mergeFields(newState))
  }, [])

  useEffect(() => {
    setState((state) => {
      const isDirty = fields.some(({ name }) => state.dirty[name])
      const isPresent = fields.some(({ name }) => state.values[name])
      if (isDirty && isPresent) {
        return state
      }
      const values = getValues(fields, defaultValues)
      return FieldSet.utils.mergeFields({
        values,
        errors: FieldSet.utils.getErrors(fields, values),
      })(state)
    })
  }, [fields, defaultValues])

  return useMemo(
    () => ({
      ...state,
      fields,
      onChange,
      isValid: !fields.some(({ name }) => state.errors[name]),
    }),
    [fields, state, onChange],
  )
}

export const mergeField = (field) => (state) =>
  mergeFields(fieldsState(field))(state)

export const fieldsState = ({
  field,
  value,
  error,
  dirty
}) => ({
  values: {
    [field]: value
  },
  errors: {
    [field]: error
  },
  dirty: {
    [field]: dirty
  }
})

export const mergeFields = ({
  values,
  errors,
  dirty
}) => (state) => ({
  values: {
    ...state.values,
    ...values
  },
  errors: {
    ...state.errors,
    ...errors
  },
  dirty: {
    ...state.dirty,
    ...dirty
  }
})

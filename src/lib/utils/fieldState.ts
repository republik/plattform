export const mergeField = (field: any) => (state: any) =>
  mergeFields(fieldsState(field))(state)

export const fieldsState = ({
  field,
  value,
  error,
  dirty
}: any) => ({
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
}: any) => (state: any) => ({
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

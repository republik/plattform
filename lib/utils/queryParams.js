
export const deserializeOrderBy = (
  str
) => {
  if (!str) {
    return
  }
  const [field, direction] = str.split('-')
  return {
    field: field.toString(),
    direction
  }
}

export const serializeOrderBy = ({
  field,
  direction
}) => `${field}-${direction}`

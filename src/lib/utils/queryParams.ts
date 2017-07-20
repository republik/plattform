export type SortDirection = 'ASC' | 'DESC'

export interface SortOptions {
  field?: string
  direction?: SortDirection
}

export const deserializeOrderBy = (
  str?: string
): SortOptions | undefined => {
  if (!str) {
    return
  }
  const [field, direction] = str.split(':')
  return {
    field: field.toString(),
    direction: direction as SortDirection
  }
}

export const serializeOrderBy = ({
  field,
  direction
}: SortOptions): string => `${field}:${direction}`
